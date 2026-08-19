import { storage } from "@/services/storage";

export const initializeSeedData = () => {
  const stories = storage.getStories();
  const quests = storage.getQuests();
  const values = storage.getValues();

  // If user already has data, never overwrite or reset!
  if (stories.length > 0 || quests.length > 0 || values.length > 0) {
    return;
  }

  // Only initialize if storage is completely blank
  storage.loadSamplePreset();
};
