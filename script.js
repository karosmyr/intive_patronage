"use strict";

// api url
const API_URL =
    "https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json";

// declaration of items creating product list
const ulList = document.querySelector(".product__container");
const loadingSpinner = document.querySelector(".spinner");
const filterInfo = document.querySelector(".product__filter-info");

// declaration of items creating cart
const ulListCart = document.querySelector(".cart__list");
const cartEmpty = document.querySelector(".cart__empty");
const cartItems = document.querySelector(".cart__items");
const removeAllButton = document.querySelector(".button--removeAll");

// declaration of items which handle cartButton for mobile version
const cartButton = document.querySelector(".cart__icon");
const cartIconSvg = document.querySelector(".cartIcon__svg");
const cancelIconSvg = document.querySelector(".cartCancel__svg");
const cartSection = document.querySelector(".cart");
const productSection = document.querySelector(".product");
const selectedIngredients = document.querySelector(
    ".product__ingredients--sort"
);
// The array which store all items from API
let pizzaList = [];
// The array which store all items in cart
let cartArr = [];

const fetchData = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
};

const renderData = async () => {
    try {
        await fetchData().then((data) => {
            loadingSpinner.classList.add("spinner--hide");
            sortData(data);
            filterDataByIngredients(selectedIngredients.value, data);
            updateCart();
        });
    } catch (error) {
        loadingSpinner.classList.add("spinner--hide");
        renderError(error);
    }
};

renderData();

const renderError = (error) => {
    const errorInfo = document.createElement("p");
    errorInfo.classList.add("product__item", "product__item--error");
    errorInfo.innerText = `${error.message}`;
    ulList.appendChild(errorInfo);
};

const sortData = (data) => {
    const selectedOption = document.querySelector(".product--sort").value;

    switch (selectedOption) {
        case "sortStrAsc":
            data.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "sortStrDesc":
            data.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "sortNumAsc":
            data.sort((a, b) => a.price - b.price);
            break;
        case "sortNumDesc":
            data.sort((a, b) => b.price - a.price);
            break;
        default:
            data.sort((a, b) => a.title.localeCompare(b.title));
    }
};

const filterDataByIngredients = (ingredients, data) => {
    const ingredientsArray = ingredients.split(",").map((item) => item.trim());

    const result = data.filter((item) =>
        ingredientsArray.every((elem) =>
            item.ingredients.join().includes(elem.toLowerCase())
        )
    );

    if (result.length === 0) {
        ulList.innerHTML = "";
        filterInfo.innerHTML = "<p>Nie mamy pizzy z takimi składnikami.</p>";
    } else {
        filterInfo.innerHTML = "";
        renderPizzaList(result);
    }
};

const renderPizzaList = (data) => {
    ulList.innerHTML = "";
    pizzaList = data;

    data.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.classList.add("product__item");
        listItem.setAttribute("id", `${item.id}`);
        ulList.appendChild(listItem);

        listItem.innerHTML = `
		<img
			src="${item.image}"
			alt="${item.title}"
			class="product__img"
		/>
		<div class="product__box">
			<h3>${item.title}</h3>
			<p class="product__description">
			${item.ingredients.join(", ")}
			</p>
		</div>
		<div class="product__actions">
			<p class="product__price">${item.price.toFixed(2)}</p>
			<button type="button" class="button button--order">Zamów</button>
		</div>
		`;
    });

    const orderButtons = ulList.querySelectorAll(".button--order");
    orderButtons.forEach((btn) => {
        btn.addEventListener("click", orderButtonHandler);
    });
};

const orderButtonHandler = (e) => {
    const itemID = +e.target.closest("li").id;
    const itemToAdd = pizzaList.find((item) => item.id === itemID);
    addItemToCart({
        id: itemToAdd.id,
        title: itemToAdd.title,
        price: itemToAdd.price,
        quantity: 1,
    });
};

const addItemToCart = (item) => {
    const alreadyInCart = cartArr.find((el) => el.id === item.id);
    if (alreadyInCart) {
        alreadyInCart.quantity++;
    } else {
        cartArr.push(item);
    }
    localStorage.setItem("cart", JSON.stringify(cartArr));
    updateCart();
};

const removeButtonHandler = (e) => {
    const cartItemID = +e.target.closest("li").id;
    const itemToRemove = cartArr.find((el) => el.id === cartItemID);
    if (itemToRemove.quantity === 1) {
        const index = cartArr.findIndex((item) => item.id === itemToRemove.id);
        cartArr.splice(index, 1);
    } else {
        itemToRemove.quantity--;
    }
    localStorage.setItem("cart", JSON.stringify(cartArr));
    updateCart();
};

const updateCart = () => {
    ulListCart.innerHTML = "";

    const cartFromStorage = localStorage.getItem("cart");

    if (cartFromStorage) {
        cartArr = JSON.parse(cartFromStorage);
    }

    cartArr.forEach((item) => {
        const ulList = document.querySelector(".cart__list");
        const cartItem = document.createElement("li");
        cartItem.classList.add("cart__item");
        cartItem.setAttribute("id", `${item.id}`);
        ulList.appendChild(cartItem);

        const cartItemContent = `
			<div>
				<h3 class="cart__item-title">${item.title}</h3>
				<div class="cart__item-summary">
					<span class="cart__item-price">${item.price.toFixed(2)} zł</span>
					<span class="cart__item-amount">x <span id="cart-${item.id}">
					${item.quantity}
					</span></span>
				</div>
			</div>
			<button type="button" class="button button--remove">Usuń</button>`;
        cartItem.innerHTML = cartItemContent;
    });

    const removeButtons = ulListCart.querySelectorAll(".button--remove");
    removeButtons.forEach((btn) => {
        btn.addEventListener("click", removeButtonHandler);
    });

    cartHandler();
    badgeHandler();
    totalPriceHandler();
};

const cartHandler = () => {
    if (cartArr.length === 0) {
        cartItems.classList.add("cart__items--hide");
        cartEmpty.classList.remove("cart__empty--hide");
    } else {
        cartItems.classList.remove("cart__items--hide");
        cartEmpty.classList.add("cart__empty--hide");
    }
};

const badgeHandler = () => {
    const badges = document.querySelectorAll(".cart__badge");
    let badgeValue = cartArr.reduce((total, item) => total + item.quantity, 0);
    badges.forEach((badge) => (badge.innerText = badgeValue));
};

const totalPriceHandler = () => {
    const totalPrice = document.querySelector(".total__price");
    let totalPriceValue = cartArr.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    totalPrice.innerText = totalPriceValue.toFixed(2) + " zł";
};

const cartButtonHandler = () => {
    cartSection.classList.toggle("cart--active");
    productSection.classList.toggle("onlyCart");
    cartIconSvg.classList.toggle("cartIcon__svg--hide");
    cancelIconSvg.classList.toggle("cartCancel__svg--hide");
};

const removeAllButtonHandler = () => {
    cartArr = [];
    localStorage.removeItem("cart");
    updateCart();
};

cartButton.addEventListener("click", cartButtonHandler);
removeAllButton.addEventListener("click", removeAllButtonHandler);
selectedIngredients.addEventListener("keyup", renderData);
window.addEventListener("resize", () => {
    if (
        window.screen.width >= 992 &&
        productSection.classList.contains("onlyCart")
    ) {
        productSection.classList.remove("onlyCart");
        cartSection.classList.remove("cart--active");
        cartIconSvg.classList.remove("cartIcon__svg--hide");
        cancelIconSvg.classList.add("cartCancel__svg--hide");
    }
});
