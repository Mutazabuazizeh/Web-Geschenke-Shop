const { createApp } = Vue

createApp({
  data() {
    return {
      cart: []
    }
  },

  computed: {
    cartNetPrice() {
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    },

    cartVat() {
      return this.cartNetPrice * 0.07
    },

    cartGrossPrice() {
      return this.cartNetPrice + this.cartVat
    }
  },

  methods: {
    orderProduct(item) {
      item.quantity++
    },

    removeProduct(item) {
      item.quantity--

      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== item.id)
      }
    }
  },

  mounted() {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      this.cart = JSON.parse(savedCart)
    }
  },

  watch: {
    cart: {
      deep: true,
      handler(newCart) {
        localStorage.setItem('cart', JSON.stringify(newCart))
      }
    }
  }
}).mount('#page-cart')
