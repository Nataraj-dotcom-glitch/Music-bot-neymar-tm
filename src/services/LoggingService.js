export class LoggingService {
  static log(type, message, details = {}) {
    console.log(`[${type.toUpperCase()}] ${message}`, details);
  }
}

export default LoggingService;
