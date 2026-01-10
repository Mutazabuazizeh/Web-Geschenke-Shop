const { createApp } = Vue

createApp({
  data() {
    return {
      title: 'Weihnachtsgeschenke-Shop',
      search: '',
      products: [
        {
          id: 1,
          title: 'Weihnachtsbuch',
          price: 19.9,
          image: './img/book.png'
        },
        {
          id: 2,
          title: 'Kerze',
          price: 9.5,
          image: './img/candle.png'
        }
      ],
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
      return this.cart.reduce((sum, item) => sum + item.quantity, 0)
    },

    cartTotalPositions() {
      return this.cart.length
    }
  },

  methods: {
    addMessage(text) {
      this.messages.push(text)

      setTimeout(() => {
        this.messages.shift()
      }, 3000)
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
        this.addMessage('Produkt zum Warenkorb hinzugefügt')
      }
    },

    removeProduct(product) {
      const item = this.cart.find(p => p.id === product.id)

      if (!item) {
        this.addMessage('Produkt ist nicht im Warenkorb')
        return
      }

      item.quantity--

      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== product.id)
        this.addMessage('Produkt aus dem Warenkorb entfernt')
      } else {
        this.addMessage('Produktmenge reduziert')
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
}).mount('#page-catalog')
