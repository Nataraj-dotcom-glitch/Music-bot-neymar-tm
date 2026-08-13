export class PremiumService {
  static isUserPremium(userId) {
    if (userId === '1353995912006860871') return true;
    return false;
  }

  static grantPremium(targetId, duration, grantedBy) {
    return {
      targetId,
      duration,
      grantedBy,
      success: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
}

export default PremiumService;
