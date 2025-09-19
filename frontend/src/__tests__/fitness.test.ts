import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../services/storageService';
import { MotionSensorService } from '../services/motionSensor';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    storageService = new StorageService();
  });

  describe('calculateCalories', () => {
    it('should calculate calories correctly using formula steps * 0.04', () => {
      // Access private method through public interface
      storageService.updateTodaysSteps(1000);
      const activity = storageService.getTodaysActivity();
      expect(activity.calories).toBe(40); // 1000 * 0.04
    });

    it('should handle zero steps', () => {
      storageService.updateTodaysSteps(0);
      const activity = storageService.getTodaysActivity();
      expect(activity.calories).toBe(0);
    });

    it('should round calories to nearest integer', () => {
      storageService.updateTodaysSteps(2500);
      const activity = storageService.getTodaysActivity();
      expect(activity.calories).toBe(100); // 2500 * 0.04 = 100
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance correctly using average step length', () => {
      storageService.updateTodaysSteps(1000);
      const activity = storageService.getTodaysActivity();
      expect(activity.distance).toBe(762); // 1000 * 0.762 meters
    });

    it('should handle zero steps', () => {
      storageService.updateTodaysSteps(0);
      const activity = storageService.getTodaysActivity();
      expect(activity.distance).toBe(0);
    });
  });

  describe('profile management', () => {
    it('should return default profile', () => {
      const profile = storageService.getProfile();
      expect(profile.stepGoal).toBe(10000);
    });

    it('should update profile correctly', () => {
      storageService.updateProfile({ stepGoal: 15000, weight: 70 });
      const profile = storageService.getProfile();
      expect(profile.stepGoal).toBe(15000);
      expect(profile.weight).toBe(70);
    });
  });

  describe('activity tracking', () => {
    it('should create todays activity if not exists', () => {
      const activity = storageService.getTodaysActivity();
      expect(activity.date).toBe(new Date().toDateString());
      expect(activity.steps).toBe(0);
      expect(activity.calories).toBe(0);
      expect(activity.distance).toBe(0);
    });

    it('should add manual entries correctly', () => {
      storageService.addManualEntry({
        activity: 'Running',
        duration: 30,
        calories: 300,
        timestamp: Date.now(),
      });
      
      const activity = storageService.getTodaysActivity();
      expect(activity.manualEntries).toHaveLength(1);
      expect(activity.manualEntries[0].activity).toBe('Running');
      expect(activity.calories).toBe(300);
    });
  });

  describe('CSV export', () => {
    it('should generate valid CSV format', () => {
      storageService.updateTodaysSteps(5000);
      const csv = storageService.exportToCsv();
      
      expect(csv).toContain('Date,Steps,Calories,Distance (km),Manual Entries');
      expect(csv).toContain('5000');
      expect(csv).toContain('200'); // 5000 * 0.04 calories
      expect(csv).toContain('3.81'); // 5000 * 0.762 / 1000 km
    });
  });
});

describe('MotionSensorService', () => {
  let motionSensor: MotionSensorService;

  beforeEach(() => {
    motionSensor = new MotionSensorService();
  });

  describe('step counting', () => {
    it('should initialize with zero steps', () => {
      expect(motionSensor.getSteps()).toBe(0);
    });

    it('should add steps correctly', () => {
      motionSensor.addSteps(100);
      expect(motionSensor.getSteps()).toBe(100);
      
      motionSensor.addSteps(50);
      expect(motionSensor.getSteps()).toBe(150);
    });

    it('should reset steps to zero', () => {
      motionSensor.addSteps(1000);
      motionSensor.reset();
      expect(motionSensor.getSteps()).toBe(0);
    });
  });

  describe('listener management', () => {
    it('should register and call listeners on step update', () => {
      const mockListener = vi.fn();
      const unsubscribe = motionSensor.onStepUpdate(mockListener);
      
      motionSensor.addSteps(10);
      expect(mockListener).toHaveBeenCalledWith(10);
      
      unsubscribe();
      motionSensor.addSteps(20);
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });
});