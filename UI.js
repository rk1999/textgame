var OregonH = OregonH || {};

OregonH.UI = {};

// show a notification in the message area
OregonH.UI.notify = function (message, type) {
  document.querySelector(
    "#updates-area"
  ).innerHTML = `<div class="update-${type}">Day ${Math.ceil(
    this.carvan.day
  )}: ${message}</div> ${document.querySelector("#updates-area").innerHTML}`;
};

// refresh visual carven stats
OregonH.UI.refreshStats = function () {
  // modify the dom
  document.querySelector("#stat-day").innerHTML = Math.ceil(this.carvan.day);
  document.querySelector("#stat-distance").innerHTML = Math.floor(
    this.carvan.distance
  );
  document.querySelector("#stat-crew").innerHTML = this.carvan.crew;
  document.querySelector("#stat-oxen").innerHTML = this.carvan.oxen;
  document.querySelector("#stat-food").innerHTML = Math.ceil(this.carvan.food);
  document.querySelector("#stat-money").innerHTML = this.carvan.money;
  document.querySelector("#stat-firepower").innerHTML = this.carvan.firepower;
  document.querySelector("#stat-weight").innerHTML =
    Math.ceil(this.carvan.weight) + "/" + this.carvan.capacity;

  // update carvan position
  document.querySelector("#carvan").style.left =
    (380 * this.carvan.distance) / OregonH.FINAL_DISTANCE + "px";
};

// show shop
OregonH.UI.showShop = function (products) {
  // get shop area
  let shopDiv = document.querySelector("#shop");
  shopDiv.classList.remove("hidden");

  // init the shop just once
  if (!this.shopInitiated) {
    // event delegation
    shopDiv.addEventListener("click", function (e) {
      // what was clicked
      let target = e.target || e.src;

      // exit button
      if (target.tagName == "BUTTON") {
        // resumes journey
        shopDiv.classList.add("hidden");
        OregonH.UI.game.resumeJourney();
      } else if (
        target.tagName === "DIV" &&
        target.className.match(/product/)
      ) {
        OregonH.UI.buyProduct({
          item: target.getAttribute("data-item"),
          qty: target.getAttribute("data-qty"),
          price: target.getAttribute("data-price"),
        });
      }
    });

    this.shopInitiated = true;
  }

  // clear existing content
  let prodsDiv = document.querySelector("#prods");
  prodsDiv.innerHTML = "";

  // show products
  let product;
  for (let i = 0; i < products.length; i++) {
    product = products[i];
    prodsDiv.innerHTML += `<div class="product" data-qty="${product.qty}" data-item="${product.item}" data-price="${product.price}">${product.qty} ${product.item} - Rs.${product.price}</div>`;
  }
};

// buy product
OregonH.UI.buyProduct = function (product) {
  // check if we can afford it
  if (product.price > OregonH.UI.carvan.money) {
    OregonH.UI.notify("Not enough money", "negative");
    return false;
  }

  OregonH.UI.carvan.money -= product.price;
  OregonH.UI.carvan[product.item] += +product.qty;
  OregonH.UI.notify("Bought " + product.qty + " x " + product.item, "positive");

  // update weight
  OregonH.UI.carvan.updateWeight();

  // update visuals
  OregonH.UI.refreshStats();
};

// show attack
OregonH.UI.showAttack = function (firepower, gold) {
  let attackDiv = document.querySelector("#attack");
  attackDiv.classList.remove("hidden");

  // keep properties
  this.firepower = firepower;
  this.gold = gold;

  // show firepower
  document.querySelector("#attack-description").innerHTML =
    "Firepower: " + firepower;

  // init once
  if (!this.attackInitiated) {
    // fight
    document
      .querySelector("#fight")
      .addEventListener("click", this.fight.bind(this));

    // run away
    document
      .querySelector("#runaway")
      .addEventListener("click", this.runaway.bind(this));

    this.attackInitiated = true;
  }
};

// fight
OregonH.UI.fight = function () {
  let firepower = this.firepower;
  let gold = this.gold;

  let damage = Math.ceil(
    Math.max(0, firepower * 2 * Math.random() - this.carvan.firepower)
  );

  // check there are survivors
  if (damage < this.carvan.crew) {
    this.carvan.crew -= damage;
    this.carvan.money += gold;
    this.notify(damage + " people were killed fighting", "negative");
    this.notify("Found Rs." + gold, "positive");
  } else {
    this.carvan.crew = 0;
    this.notify("Everybody died in the fight", "negative");
  }

  // resume journey
  document.querySelector("#attack").classList.add("hidden");
  this.game.resumeJourney();
};

OregonH.UI.runaway = function () {
  let firepower = this.firepower;
  let damage = Math.ceil(Math.max(0, (firepower * Math.random()) / 2));

  // check if there are survivors
  if (damage < this.carvan.crew) {
    this.carvan.crew -= damage;
    this.notify(damage + " people were killed running", "negative");
  } else {
    this.carvan.crew = 0;
    this.notify("Everybody died running away", "negative");
  }

  // remove event listner
  document.querySelector("#runaway").removeEventListener("click", this.runaway);

  // resume journey
  document.querySelector("#attack").classList.add("hidden");
  this.game.resumeJourney();
};
