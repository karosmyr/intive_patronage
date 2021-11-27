// api url
const API_URL =
	'https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json';

// declaration of items creating product list
let ulList;
let listItem;
let loadingSpinner;
let orderButtons;

// error message paragraph
let errorInfo;

// The array which store all items from API
let pizzaList = [];
// The array which store all items in cart
let cartArr = [];

// declaration of items creating cart
let ulListCart;
let cartOrder;
let cartEmpty;
let cartTotal;

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
};

const prepareDOMElements = () => {
	ulList = document.querySelector('#product-container');
	cartOrder = document.querySelector('#cart-order');
	ulListCart = document.querySelector('#cart-list');
	loadingSpinner = document.querySelector('.spinner');
};

const prepareDOMEvents = () => {
	ulListCart.addEventListener('click', removeButtonHandler);
};

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
			loadingSpinner.classList.add('spinner--hide');
			renderPizzaList(data);
		});
	} catch (error) {
		loadingSpinner.classList.add('spinner--hide');
		renderError(error);
	}
};

renderData();

const renderError = (error) => {
	errorInfo = document.createElement('p');
	errorInfo.classList.add('product__item', 'product__item--error');
	errorInfo.innerText = `${error.message}`;
	ulList.appendChild(errorInfo);
};

const renderPizzaList = (data) => {
	pizzaList = data;

	data.map((item) => {
		listItem = document.createElement('li');
		listItem.classList.add('product__item');
		listItem.setAttribute('id', `${item.id}`);
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
			${item.ingredients.join(', ')}
			</p>
		</div>
		<div class="product__actions">
			<p class="product__price">${item.price.toFixed(2)}</p>
			<button type="button" class="button button--order">Zamów</button>
		</div>
		`;
	});

	orderButtons = ulList.querySelectorAll('.button--order');
	orderButtons.forEach((btn) => {
		btn.addEventListener('click', orderButtonHandler);
	});
};


// the function executes when order button is clicked
const orderButtonHandler = (e) => {
	if (e.target.matches('.button--order')) {
		const itemID = e.target.closest('li').id;
		pizzaList.forEach((item) => {
			if (item.id == itemID) {
				const quantity = 1;
				addItemToCart({
					id: item.id,
					title: item.title,
					price: item.price,
					quantity,
				});
			}
		});
	}
};

// the function adds an item to the cart
const addItemToCart = (item) => {
	// Firstly the function is checking if the item is not on the cart list yet,
	// if the item is already on the list, this function changes only the quantity,
	// and call functions for total price and the number of items in badge header.
	let alreadyInCart = false;

	cartArr.forEach((el) => {
		if (el.id === item.id) {
			alreadyInCart = true;
			el.quantity++;
			const amount = document.querySelector(`#cart-${el.id}`);
			amount.innerText = el.quantity;
			badgeHandler();
			totalPriceHandler();
		}
	});
	// this code executes only when the item is not on the cart list yet
	// Function adds new item to cart
	if (!alreadyInCart) {
		cartArr.push(item);
		badgeHandler();
		cartHandler();
		totalPriceHandler();
		const cartList = document.querySelector('#cart-list');
		const cartItem = document.createElement('li');
		cartItem.classList.add('cart__item');
		cartItem.setAttribute('id', `${item.id}`);
		cartList.appendChild(cartItem);

		const cartItemContent = `
    <div>
        <h3 class="cart__item-title">${item.title}</h3>
        <div class="cart__item-summary">
            <span class="cart__item-price">${item.price.toFixed(2)}</span>
            <span class="cart__item-amount">x <span id="cart-${item.id}">${
			item.quantity
		}</span></span>
        </div>
    </div>
    <button type="button" id="removeBtn" class="button button--remove">Usuń</button>`;
		cartItem.innerHTML = cartItemContent;
	}
};

// Function removes an item from the cart
const removeButtonHandler = (e) => {
	if (e.target.matches('#removeBtn')) {
		const cartItem = e.target.closest('li');
		cartArr.forEach((el) => {
			if (el.id == cartItem.id) {
				if (el.quantity === 1) {
					const index = cartArr.findIndex((item) => item.id == cartItem.id);
					cartArr.splice(index, 1);
					badgeHandler();
					totalPriceHandler();
					cartItem.remove();
					if (cartArr.length === 0) {
						cartHandler();
					}
				} else {
					// if there is more items then 1, function changes quantity of items by 1
					el.quantity--;
					const amount = document.querySelector(`#cart-${el.id}`);
					amount.innerText = el.quantity;
					badgeHandler();
					totalPriceHandler();
				}
			}
		});
	}
};

// this function executes only if the first item is added to cart or the last item is removed from cart
const cartHandler = () => {
	if (cartArr.length === 0) {
		// when the last item from cart is removed, function removing total price information and render another paragraph
		cartEmpty = document.createElement('div');
		cartEmpty.classList.add('cart__empty');
		cartEmpty.setAttribute('id', 'empty');
		cartEmpty.innerHTML = '<p>Głodny?<br />Zamów naszą pizzę!</p>';
		cartOrder.appendChild(cartEmpty);
		cartTotal.remove();
	} else if (cartArr.length === 1) {
		// when first item is added to the cart, removes a paragraph and adding info about total price of all items.
		const cartEmptyToRemove = document.querySelector('#empty');
		cartEmptyToRemove.remove();

		cartTotal = document.createElement('div');
		cartTotal.classList.add('cart__total');
		cartOrder.appendChild(cartTotal);
		const cartTotalContent = `
        <span>Do zapłaty:</span>
        <span id="total-price"></span>`;
		cartTotal.innerHTML = cartTotalContent;
	}
};

// function checking the amount of all items and assigns this value to the badge
// the function is executed each time any button is pressed
const badgeHandler = () => {
	const badge = document.querySelector('#badge');
	let badgeValue = 0;
	for (let i = 0; i < cartArr.length; i++) {
		badgeValue = badgeValue + cartArr[i].quantity;
	}
	badge.innerText = badgeValue;
};

// function checking total price of all items from the cart
// the function is executed each time any button is pressed
const totalPriceHandler = () => {
	const totalPrice = document.querySelector('#total-price');
	let totalPriceValue = 0;
	for (let i = 0; i < cartArr.length; i++) {
		totalPriceValue = totalPriceValue + cartArr[i].quantity * cartArr[i].price;
	}
	totalPrice.innerText = totalPriceValue.toFixed(2);
};

document.addEventListener('DOMContentLoaded', main);
