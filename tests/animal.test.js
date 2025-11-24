const Animal = require('../models/Animal');
const Bird = require('../models/Bird');
const Dog = require('../models/Dog');

describe('Animal Base Class', () => {
  test('should not allow direct instantiation', () => {
    expect(() => new Animal('Test', 4)).toThrow('Cannot instantiate abstract class');
  });
});

describe('Bird Class', () => {
  test('should create a bird with correct properties', () => {
    const bird = new Bird('Tweety', true, false);
    expect(bird.name).toBe('Tweety');
    expect(bird.legs).toBe(2);
    expect(bird.canFlyAbility).toBe(true);
    expect(bird.canCrowAbility).toBe(false);
  });

  test('should fly when canFly is true', () => {
    const bird = new Bird('Eagle', true, false);
    bird.setAction('fly');
    const result = bird.performAction();
    expect(result).toContain('flying');
  });

  test('should not fly when canFly is false', () => {
    const bird = new Bird('Penguin', false, false);
    expect(() => bird.setAction('fly')).toThrow('not a valid action');
  });

  test('should crow when canCrow is true', () => {
    const rooster = new Bird('Rooster', false, true);
    rooster.setAction('crow');
    const result = rooster.performAction();
    expect(result).toContain('crowing');
  });

  test('should not perform action when hungry', () => {
    const bird = new Bird('Hungry Bird', true, false);
    bird.setAction('fly');
    bird.setHungry(true);
    expect(() => bird.performAction()).toThrow('cannot perform action because they are hungry');
  });

  test('should not perform action when sleepy', () => {
    const bird = new Bird('Sleepy Bird', true, false);
    bird.setAction('fly');
    bird.setSleepy(true);
    expect(() => bird.performAction()).toThrow('cannot perform action because they are sleepy');
  });
});

describe('Dog Class', () => {
  test('should create a dog with correct properties', () => {
    const dog = new Dog('Rex', true, true);
    expect(dog.name).toBe('Rex');
    expect(dog.legs).toBe(4);
    expect(dog.canBarkAbility).toBe(true);
    expect(dog.canChaseAbility).toBe(true);
  });

  test('should bark when canBark is true', () => {
    const dog = new Dog('Barker', true, false);
    dog.setAction('bark');
    const result = dog.performAction();
    expect(result).toContain('barking');
  });

  test('should chase when canChase is true', () => {
    const dog = new Dog('Sheepdog', false, true);
    dog.setAction('chase');
    const result = dog.performAction();
    expect(result).toContain('chasing sheep');
  });

  test('should not perform duty when hungry', () => {
    const dog = new Dog('Guard Dog', true, false);
    dog.setDuty('guard the farm');
    dog.setHungry(true);
    expect(() => dog.performDuty()).toThrow('cannot perform duty because they are hungry');
  });
});

describe('Universal Animal Behaviors', () => {
  let bird;

  beforeEach(() => {
    bird = new Bird('Test Bird', true, false);
  });

  test('should eat when hungry', () => {
    bird.setHungry(true);
    const result = bird.eat();
    expect(result).toContain('eating');
    expect(bird.isHungry).toBe(false);
  });

  test('should not eat when not hungry', () => {
    const result = bird.eat();
    expect(result).toContain('not hungry');
  });

  test('should sleep when sleepy', () => {
    bird.setSleepy(true);
    const result = bird.sleep();
    expect(result).toContain('sleeping');
    expect(bird.isSleepy).toBe(false);
  });

  test('should set and perform duty', () => {
    bird.setDuty('lay eggs');
    expect(bird.currentDuty).toBe('lay eggs');
    const result = bird.performDuty();
    expect(result).toContain('performing duty: lay eggs');
  });

  test('should only allow one action at a time', () => {
    bird.setAction('fly');
    expect(bird.currentAction).toBe('fly');
    // Setting a new action should replace the old one
    bird.setAction('fly');
    expect(bird.currentAction).toBe('fly');
  });

  test('should require a duty to perform duty', () => {
    expect(() => bird.performDuty()).toThrow('has no duty assigned');
  });

  test('should require an action to perform action', () => {
    expect(() => bird.performAction()).toThrow('has no action assigned');
  });
});

describe('Runtime Updates', () => {
  test('should update action at runtime', () => {
    const dog = new Dog('Flexible Dog', true, true);
    
    dog.setAction('bark');
    expect(dog.currentAction).toBe('bark');
    
    dog.setAction('chase');
    expect(dog.currentAction).toBe('chase');
    
    const result = dog.performAction();
    expect(result).toContain('chasing');
  });

  test('should update duty at runtime', () => {
    const bird = new Bird('Flexible Bird', true, false);
    
    bird.setDuty('lay eggs');
    expect(bird.currentDuty).toBe('lay eggs');
    
    bird.setDuty('wake everyone up');
    expect(bird.currentDuty).toBe('wake everyone up');
  });
});
