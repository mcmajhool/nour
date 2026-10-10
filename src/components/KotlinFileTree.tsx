import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  Search,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react';
import { KotlinProjectFile } from '../data/kotlinProjectFiles';

interface TreeNode {
  id: string;
  name: string;
  fullPath: string;
  type: 'folder' | 'file';
  children: TreeNode[];
  fileData?: KotlinProjectFile;
}

interface KotlinFileTreeProps {
  files: KotlinProjectFile[];
  selectedPath: string;
  onSelectFile: (path: string) => void;
}

function buildFileTree(files: KotlinProjectFile[], compactPackages: boolean): TreeNode[] {
  const root: TreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let existingNode = currentLevel.find((node) => node.name === part && node.type === (isFile ? 'file' : 'folder'));

      if (!existingNode) {
        existingNode = {
          id: currentPath,
          name: part,
          fullPath: currentPath,
          type: isFile ? 'file' : 'folder',
          children: [],
          fileData: isFile ? file : undefined,
        };
        currentLevel.push(existingNode);
      }

      if (!isFile) {
        currentLevel = existingNode.children;
      }
    });
  });

  // Sort folders first, then files alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  };

  // Compact single-child folder chains (like Android Studio's "Compact Middle Packages" feature)
  const compactFolderChains = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map((node) => {
      if (node.type === 'file') return node;

      let current = { ...node, children: compactFolderChains(node.children) };
      while (
        current.children.length === 1 &&
        current.children[0].type === 'folder'
      ) {
        const onlyChild = current.children[0];
        current = {
          id: onlyChild.id,
          name: `${current.name}/${onlyChild.name}`,
          fullPath: onlyChild.fullPath,
          type: 'folder',
          children: onlyChild.children,
        };
      }
      return current;
    });
  };

  const sorted = sortNodes(root);
  return compactPackages ? compactFolderChains(sorted) : sorted;
}

function collectAllFolderIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const traverse = (list: TreeNode[]) => {
    list.forEach((n) => {
      if (n.type === 'folder') {
        ids.push(n.id);
        traverse(n.children);
      }
    });
  };
  traverse(nodes);
  return ids;
}

function countFilesInFolder(node: TreeNode): number {
  if (node.type === 'file') return 1;
  return node.children.reduce((acc, child) => acc + countFilesInFolder(child), 0);
}

export const KotlinFileTree: React.FC<KotlinFileTreeProps> = ({
  files,
  selectedPath,
  onSelectFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [compactPackages, setCompactPackages] = useState(true);

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q) ||
        f.descriptionAr.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const treeNodes = useMemo(
    () => buildFileTree(filteredFiles, compactPackages),
    [filteredFiles, compactPackages]
  );

  const allFolderIds = useMemo(() => collectAllFolderIds(treeNodes), [treeNodes]);

  // Expand all folders by default so the tree is immediately scannable
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const isFolderOpen = (folderId: string) => {
    if (searchQuery.trim()) return true;
    return !collapsedFolders[folderId];
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedFolders({});
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    allFolderIds.forEach((id) => {
      next[id] = true;
    });
    setCollapsedFolders(next);
  };

  const getFileIcon = (file?: KotlinProjectFile) => {
    if (!file) return <FileCode className="w-4 h-4 text-slate-400 shrink-0" />;
    switch (file.language) {
      case 'kotlin':
        return <FileCode className="w-4 h-4 text-emerald-700 shrink-0" />;
      case 'java':
        return <FileCode className="w-4 h-4 text-orange-600 shrink-0" />;
      case 'gradle':
        return <Settings className="w-4 h-4 text-amber-700 shrink-0" />;
      case 'xml':
        return <FileCode className="w-4 h-4 text-sky-700 shrink-0" />;
      case 'markdown':
        return <FileText className="w-4 h-4 text-slate-600 shrink-0" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const renderNode = (node: TreeNode, depth: number) => {
    if (node.type === 'folder') {
      const open = isFolderOpen(node.id);
      const fileCount = countFilesInFolder(node);
      return (
        <div key={node.id} className="select-none">
          <button
            type="button"
            onClick={() => toggleFolder(node.id)}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className="w-full py-1.5 pr-2.5 rounded-lg text-left hover:bg-slate-100/90 text-xs font-medium text-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {open ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
              )}
              {open ? (
                <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-600/80 shrink-0" />
              )}
              <span className="font-mono-code truncate text-[12px] text-slate-800">
                {node.name}
              </span>
            </div>
            <span className="text-[10px] font-mono-code text-slate-400 tabular-nums shrink-0">
              {fileCount}
            </span>
          </button>

          {open && (
            <div className="mt-0.5 space-y-0.5 border-l border-slate-200/80 ml-3.5">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = node.fullPath === selectedPath;
    return (
      <button
        key={node.id}
        type="button"
        onClick={() => onSelectFile(node.fullPath)}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
        className={`w-full py-2 pr-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
          isSelected
            ? 'bg-emerald-900 text-white font-semibold shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isSelected ? (
            <FileCode className="w-4 h-4 text-emerald-200 shrink-0" />
          ) : (
            getFileIcon(node.fileData)
          )}
          <span className="font-mono-code truncate text-[12px]">
            {node.name}
          </span>
        </div>

        <span
          className={`text-[10px] font-mono-code uppercase shrink-0 ${
            isSelected ? 'text-emerald-200' : 'text-slate-400'
          }`}
        >
          {node.fileData?.language}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
      {/* Header & Tree Controls */}
      <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            ملفات مشروع الأندرويد (Kotlin)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            هيكل شجري مطابق لمستكشف Android Studio
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setCompactPackages((prev) => !prev)}
            title={
              compactPackages
                ? 'فك دمج حزم الجافا/كوتلن المتداخلة'
                : 'دمج المسارات المتداخلة (Compact Packages)'
            }
            className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              compactPackages
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            دمج الحزم
          </button>
          <button
            type="button"
            onClick={handleExpandAll}
            title="توسيع كل المجلدات"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            title="طي كل المجلدات"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronsDownUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن ملف أو مجلد (مثل Tasbih أو gradle)..."
          className="w-full bg-slate-50 border border-slate-200/90 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-800"
        />
      </div>

      {/* Tree View Container (LTR for authentic file/package hierarchy) */}
      <div
        dir="ltr"
        className="space-y-0.5 max-h-[540px] overflow-y-auto pr-1 pt-1"
      >
        {treeNodes.length > 0 ? (
          treeNodes.map((node) => renderNode(node, 0))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400" dir="rtl">
            لا توجد ملفات مطابقة لبحثك
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>إجمالي الملفات المعروضة</span>
        <span className="font-mono-code tabular-nums font-semibold text-slate-700">
          {filteredFiles.length} / {files.length} files
        </span>
      </div>
    </div>
  );
};
