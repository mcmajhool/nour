package com.nooralmuslim.app.util;

/**
 * حاسبة فلكية بلغة Java لحساب زاوية القبلة والمسافة إلى الكعبة المشرفة
 * متوافقة بالكامل مع استدعاءات Kotlin داخل مشروع Android Studio.
 */
public final class PrayerTimeCalculator {

    private static final double KAABA_LAT = 21.4225;
    private static final double KAABA_LNG = 39.8262;

    private PrayerTimeCalculator() {
        // Utility class
    }

    public static double calculateQiblaBearing(double userLat, double userLng) {
        double phi1 = Math.toRadians(userLat);
        double phi2 = Math.toRadians(KAABA_LAT);
        double deltaLng = Math.toRadians(KAABA_LNG - userLng);

        double y = Math.sin(deltaLng) * Math.cos(phi2);
        double x = Math.cos(phi1) * Math.sin(phi2)
                - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);

        double bearing = Math.toDegrees(Math.atan2(y, x));
        return (bearing + 360.0) % 360.0;
    }

    public static int calculateDistanceToMakkahKm(double userLat, double userLng) {
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(KAABA_LAT - userLat);
        double dLng = Math.toRadians(KAABA_LNG - userLng);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(userLat))
                * Math.cos(Math.toRadians(KAABA_LAT))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (int) Math.round(earthRadiusKm * c);
    }
}
