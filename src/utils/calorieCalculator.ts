import { CardioUserProfile } from '../types/workout';

export const ACTIVITY_MET_VALUES: Record<string, number> = {
  vogatore: 7.5,
  air_bike: 8.5,
  skierg: 8.0,
  tapis_roulant: 8.3,
  cyclette: 7.0,
  corda: 10.0,
  ellittica: 6.8,
  cardio_libero: 7.5
};

export const DEFAULT_USER_PROFILE: CardioUserProfile = {
  gender: 'uomo',
  weightKg: 75,
  heightCm: 175,
  age: 30
};

export const BIOMETRICS_STORAGE_KEY = 'irontrack_user_biometrics_v1';

export function getSavedUserProfile(): CardioUserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(BIOMETRICS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.weightKg && parsed.gender) {
        return {
          gender: parsed.gender === 'donna' ? 'donna' : 'uomo',
          weightKg: Math.max(30, Math.min(250, Number(parsed.weightKg) || 75)),
          heightCm: Math.max(100, Math.min(250, Number(parsed.heightCm) || 175)),
          age: Math.max(12, Math.min(100, Number(parsed.age) || 30))
        };
      }
    }
  } catch (err) {
    console.warn('Error reading saved user profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: CardioUserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BIOMETRICS_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Error saving user profile:', err);
  }
}

/**
 * Calculates energy expenditure in calories (kcal) for a cardio workout session.
 * Uses Keytel et al. (2005) formula when heart rate (HR) is available:
 * Men: [(-55.0969 + (0.6309 x HR) + (0.1988 x Weight) + (0.2017 x Age)) / 4.184] x 60 x Duration_hours
 * Women: [(-20.4022 + (0.4472 x HR) - (0.1263 x Weight) + (0.0740 x Age)) / 4.184] x 60 x Duration_hours
 *
 * If HR is not available, uses MET (Compendium of Physical Activities) formula:
 * kcal = (MET x 3.5 x weight_kg / 200) x duration_minutes
 */
export function calculateCardioCalories(
  elapsedSeconds: number,
  currentOrAvgBpm: number | null | undefined,
  activityKey: string,
  userProfile?: CardioUserProfile
): number {
  if (elapsedSeconds <= 0) return 0;
  const profile = userProfile || getSavedUserProfile();
  const durationMin = elapsedSeconds / 60;

  if (currentOrAvgBpm && currentOrAvgBpm > 45 && currentOrAvgBpm < 240) {
    const hr = currentOrAvgBpm;
    const w = profile.weightKg;
    const a = profile.age;

    let calPerMin = 0;
    if (profile.gender === 'donna') {
      calPerMin = (-20.4022 + (0.4472 * hr) - (0.1263 * w) + (0.0740 * a)) / 4.184;
    } else {
      calPerMin = (-55.0969 + (0.6309 * hr) + (0.1988 * w) + (0.2017 * a)) / 4.184;
    }

    // Safety clamp (calories per minute cannot be negative)
    const clampedCalPerMin = Math.max(1.5, calPerMin);
    return Math.max(1, Math.round(clampedCalPerMin * durationMin));
  }

  // Fallback to MET formula
  const met = ACTIVITY_MET_VALUES[activityKey] || 7.5;
  const calPerMin = (met * 3.5 * profile.weightKg) / 200;
  return Math.max(1, Math.round(calPerMin * durationMin));
}
