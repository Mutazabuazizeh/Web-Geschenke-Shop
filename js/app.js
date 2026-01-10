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
        (s, i) => s + i.price * i.quantity,
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
        this.addMessage('Produktmenge erhöht')
      } else {
        this.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1
        })
        this.addMessage('Produkt hinzugefügt')
      }
    },

    removeProduct(product) {
      const item = this.cart.find(p => p.id === product.id)
      if (!item) return

      item.quantity--
      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== product.id)
        this.addMessage('Produkt entfernt')
      } else {
        this.addMessage('Produktmenge reduziert')
      }
    }
  },

  mounted() {
    fetch('php/products.php')
      .then(res => res.json())
      .then(data => {
        this.products = data.map(p => ({
          ...p,
          price: Number(p.price)
        }))
      })
      .catch(() => {
        this.addMessage('Fehler beim Laden der Produkte')
      })
  }
}).mount('#page-catalog')
