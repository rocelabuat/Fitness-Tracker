export class MotionSensorService {
  private stepCount = 0;
  private lastAcceleration = { x: 0, y: 0, z: 0 };
  private stepThreshold = 1.2;
  private listeners: ((steps: number) => void)[] = [];
  private isSupported = false;
  private permission: PermissionState | null = null;

  constructor() {
    this.checkSupport();
  }

  private async checkSupport() {
    this.isSupported = 'DeviceMotionEvent' in window && 'requestPermission' in (DeviceMotionEvent as any);
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      if ('requestPermission' in (DeviceMotionEvent as any)) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        this.permission = permission;
        return permission === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  startTracking(initialSteps = 0) {
    this.stepCount = initialSteps;

    if (!this.isSupported) {
      console.warn('Motion sensors not supported');
      return false;
    }

    window.addEventListener('devicemotion', this.handleMotion);
    return true;
  }

  stopTracking() {
    window.removeEventListener('devicemotion', this.handleMotion);
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
    
    // Calculate acceleration magnitude
    const currentAcceleration = Math.sqrt(x * x + y * y + z * z);
    const lastMagnitude = Math.sqrt(
      this.lastAcceleration.x ** 2 + 
      this.lastAcceleration.y ** 2 + 
      this.lastAcceleration.z ** 2
    );

    // Detect step if acceleration change exceeds threshold
    if (Math.abs(currentAcceleration - lastMagnitude) > this.stepThreshold) {
      this.stepCount++;
      this.notifyListeners();
    }

    this.lastAcceleration = { x, y, z };
  };

  addSteps(steps: number) {
    this.stepCount += steps;
    this.notifyListeners();
  }

  getSteps() {
    return this.stepCount;
  }

  reset() {
    this.stepCount = 0;
    this.notifyListeners();
  }

  onStepUpdate(callback: (steps: number) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.stepCount));
  }

  isMotionSupported() {
    return this.isSupported;
  }
}

export const motionSensor = new MotionSensorService();