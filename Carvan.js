var OregonH = OregonH || {};

OregonH.Carvan = {};

OregonH.Carvan.init = function (stats) {
  this.day = stats.day;
  this.distance = stats.distance;
  this.crew = stats.crew;
  this.food = stats.food;
  this.oxen = stats.oxen;
  this.money = stats.money;
  this.firepower = stats.firepower;
};

// update weight and capacity
OregonH.Carvan.updateWeight = function () {
  let droppedFood = 0;
  let droppedGuns = 0;

  // how much can the carvan carry
  this.capacity =
    this.oxen * OregonH.WEIGHT_PER_OX + this.crew * OregonH.WEIGHT_PER_PERSON;
  this.weight =
    this.food * OregonH.FOOD_WEIGHT + this.firepower * OregonH.FIREPOWER_WEIGHT;

  // drop things behind if it's too much weihght
  // assume guns get dropped before food
  while (this.firepower && this.capacity <= this.weight) {
    this.firepower--;
    this.weight = this.weight - OregonH.FIREPOWER_WEIGHT;
    droppedGuns++;
  }

  if (droppedGuns) {
    this.ui.notify(`Left ${droppedGuns} guns behind`, "negative");
  }

  while (this.food && this.capacity <= this.weight) {
    this.food--;
    this.weight = this.weight - OregonH.FOOD_WEIGHT;
    droppedFood++;
  }

  if (droppedFood) {
    this.ui.notify(`Left ${droppedFood} food provisions behind`, "negative");
  }
};

// update covered distance
OregonH.Carvan.updateDistance = function () {
  // the closer to capacity the slower
  let diff = this.capacity - this.weight;
  let speed = OregonH.SLOW_SPPED + (diff / this.capacity) * OregonH.FULL_SPEED;
  this.distance += speed;
};

// food consumption
OregonH.Carvan.consumeFood = function () {
  this.food -= this.crew * OregonH.FOOD_PER_PERSON;

  if (this.food <= 0) {
    this.food = 0;
  }
};
