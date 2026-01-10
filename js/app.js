const { createApp } = Vue

createApp({
  data() {
    return {
      title: 'Weihnachtsgeschenke-Shop',
      search: '',
      products: [],
      cart: [],
      messages: []
    }
  },

  computed: {
    filteredProducts() {
      const q = this.search.toLowerCase()
      return this.products.filter(p =>
        p.title.toLowerCase().includes(q)
      )
    },

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
    },

    cartTotalItems() {
      return this.cart.reduce((s, i) => s + i.quantity, 0)
    },

    cartTotalPositions() {
      return this.cart.length
    }
  },

  methods: {
    addMessage(text) {
      this.messages.push(text)
      setTimeout(() => this.messages.shift(), 3000)
    },

    orderProduct(product) {
      const item = this.cart.find(p => p.id === product.id)

      if (item) {
        item.quantity++
      } else {
        this.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1
        })
      }
      this.addMessage('Produkt hinzugefügt')
    },

    removeProduct(product) {
      const item = this.cart.find(p => p.id === product.id)
      if (!item) return

      item.quantity--
      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== product.id)
      }
      this.addMessage('Produkt entfernt')
    },

    checkout() {
      if (this.cart.length === 0) {
        this.addMessage('Warenkorb ist leer')
        return
      }

      fetch('php/order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: this.cart,
          total: this.cartGrossPrice
        })
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            this.addMessage('Bestellung gespeichert')
            this.cart = []
            localStorage.removeItem('cart')
          } else {
            this.addMessage('Fehler beim Speichern')
          }
        })
        .catch(() => this.addMessage('Serverfehler'))
    }
  },

  mounted() {
    fetch('php/products.php')
      .then(r => r.json())
      .then(data => this.products = data)

    const savedCart = localStorage.getItem('cart')
    if (savedCart) this.cart = JSON.parse(savedCart)
  },

  watch: {
    cart: {
      deep: true,
      handler(c) {
        localStorage.setItem('cart', JSON.stringify(c))
      }
    }
  }
}).mount('#page-catalog')
