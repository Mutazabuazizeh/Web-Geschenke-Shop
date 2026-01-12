const { createApp } = Vue

createApp({
  data() {
    return {
      cart: []
    }
  },

  computed: {
    cartNetPrice() {
      return this.cart.reduce((s, i) => s + i.price * i.quantity, 0)
    },
    cartVat() {
      return this.cartNetPrice * 0.07
    },
    cartGrossPrice() {
      return this.cartNetPrice + this.cartVat
    }
  },

  mounted() {
    const c = localStorage.getItem('cart')
    if (c) this.cart = JSON.parse(c)
  }
}).mount('#page-cart')
