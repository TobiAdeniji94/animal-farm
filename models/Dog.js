const Animal = require('./Animal');

/**
 * Dog class
 */
class Dog extends Animal {
  constructor(name, canBark = false, canChase = false) {
    super(name, 4);
    this.canBarkAbility = canBark;
    this.canChaseAbility = canChase;
    
    // Set available actions based on abilities
    this.availableActions = [];
    if (canBark) this.availableActions.push('bark');
    if (canChase) this.availableActions.push('chase');
  }

  bark() {
    if (!this.canBarkAbility) {
      throw new Error(`${this.name} cannot bark.`);
    }
    return `${this.name} is barking!`;
  }

  chase() {
    if (!this.canChaseAbility) {
      throw new Error(`${this.name} cannot chase sheep.`);
    }
    return `${this.name} is chasing sheep!`;
  }

  getStatus() {
    return {
      ...super.getStatus(),
      canBark: this.canBarkAbility,
      canChase: this.canChaseAbility
    };
  }
}

module.exports = Dog;
