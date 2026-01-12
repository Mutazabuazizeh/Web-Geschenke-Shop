const { createApp } = Vue

createApp({
  data() {
    return {
      title: 'Weihnachtsgeschenke-Shop',
      search: '',
      products: [],
      cart: [],
      messages: [],
      isAdmin: false 
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
          price: Number(product.price),
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
    const user = JSON.parse(localStorage.getItem('user'))
    this.isAdmin = user && user.role === 'admin'

    fetch('php/products.php')
      .then(r => r.json())
      .then(data => {
        this.products = data.map(p => ({
          ...p,
          price: Number(p.price)
        }))
      })
      .catch(() => {
        this.addMessage('Fehler beim Laden der Produkte')
      })

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
}).mount('#page-catalog')
