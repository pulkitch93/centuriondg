import { Site, Match } from '@/types/site';

const SITES_KEY = 'centurion_sites';
const MATCHES_KEY = 'centurion_matches';

export const storage = {
  getSites: (): Site[] => {
    const data = localStorage.getItem(SITES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setSites: (sites: Site[]) => {
    localStorage.setItem(SITES_KEY, JSON.stringify(sites));
  },
  
  getMatches: (): Match[] => {
    const data = localStorage.getItem(MATCHES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setMatches: (matches: Match[]) => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  },
};
