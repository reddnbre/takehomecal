const KEY = "takehomecalc.profile.v1";

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function clearProfile() {
  localStorage.removeItem(KEY);
}
