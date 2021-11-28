// api url
const API_URL =
    "https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json";
// declaration of items creating product list
const ulList = document.querySelector(".product__container");
const loadingSpinner = document.querySelector(".spinner");
// declaration of items creating cart
const ulListCart = document.querySelector(".cart__list");
const cartEmpty = document.querySelector(".cart__empty");
const cartTotal = document.querySelector(".cart__total");

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
            renderPizzaList(data);
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

const renderPizzaList = (data) => {
    pizzaList = data;

    data.map((item) => {
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

// the function executes when order button is clicked
const orderButtonHandler = (e) => {
    if (e.target.matches(".button--order")) {
        const itemID = e.target.closest("li").id;
        const itemToAdd = pizzaList.find((item) => item.id == itemID);
        addItemToCart({
            id: itemToAdd.id,
            title: itemToAdd.title,
            price: itemToAdd.price,
            quantity: 1,
        });
    }
};

const addItemToCart = (item) => {
    const alreadyInCart = cartArr.find((el) => el.id === item.id);
    if (alreadyInCart) {
        alreadyInCart.quantity++;
    } else {
        cartArr.push(item);
    }
    updateCart();
};

// Function removes an item from the cart
const removeButtonHandler = (e) => {
    if (e.target.matches(".button--remove")) {
        const cartItemID = e.target.closest("li").id;
        const itemToRemove = cartArr.find((el) => el.id == cartItemID);
        if (itemToRemove.quantity === 1) {
            const index = cartArr.findIndex(
                (item) => item.id === itemToRemove.id
            );
            cartArr.splice(index, 1);
        } else {
            itemToRemove.quantity--;
        }
        updateCart();
    }
};

const updateCart = () => {
    while (ulListCart.firstChild) {
        ulListCart.removeChild(ulListCart.firstChild);
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
        cartTotal.classList.add("cart__total--hide");
        cartEmpty.classList.remove("cart__empty--hide");
    } else {
        cartTotal.classList.remove("cart__total--hide");
        cartEmpty.classList.add("cart__empty--hide");
    }
};

// function checking the amount of all items and assigns this value to the badge
// the function is executed each time any button is pressed
const badgeHandler = () => {
    const badge = document.querySelector(".cart__badge");
    let badgeValue = cartArr.reduce((total, item) => total + item.quantity, 0);
    badge.innerText = badgeValue;
};

// function checking total price of all items from the cart
// the function is executed each time any button is pressed
const totalPriceHandler = () => {
    const totalPrice = document.querySelector(".total__price");
    let totalPriceValue = cartArr.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    totalPrice.innerText = totalPriceValue.toFixed(2) + " zł";
};
