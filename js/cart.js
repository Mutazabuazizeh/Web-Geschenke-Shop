const { createApp } = Vue

createApp({
  data() {
    return {
      cart: [],
      messages: []
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

  methods: {
    addMessage(msg) {
      this.messages.push(msg);
      setTimeout(() => this.messages.shift(), 3000);
    },

    orderProduct(item) {
      if (item.quantity >= item.stock) {
        this.addMessage(`Nur ${item.stock} Stück verfügbar. Du versuchst ${item.quantity + 1} hinzuzufügen.`);
        return;
      }
      item.quantity++
      this.saveCart()
    },

    removeProduct(item) {
      item.quantity--
      if (item.quantity === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id)
      }
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },

    async pay() {
      console.log('=== PAY FUNCTION STARTED ===')
      const userStr = localStorage.getItem('user')
      console.log('Raw user from localStorage:', userStr)
      
      const user = JSON.parse(userStr || 'null')
      console.log('Parsed user object:', user)
      console.log('user.id:', user?.id)
      console.log('Type of user.id:', typeof user?.id)
      
      if (!user) {
        alert('Bitte melden Sie sich zuerst an')
        window.location.href = 'auth.html'
        return
      }

      if (!user.id) {
        alert('Fehler: Benutzer-ID nicht gefunden. Bitte melden Sie sich ab und neu an.')
        console.error('User object missing id:', user)
        return
      }

      if (this.cart.length === 0) {
        alert('Warenkorb ist leer')
        return
      }

      try {
        console.log('Sending order with userId:', user.id)
        const orderBody = {
          cart: this.cart,
          userId: user.id,
          total: this.cartGrossPrice
        }
        console.log('Order body:', JSON.stringify(orderBody))

        const orderRes = await fetch('php/order.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderBody)
        })

        console.log('Order response status:', orderRes.status)
        const orderData = await orderRes.json()
        console.log('Order response data:', orderData)

        if (!orderRes.ok) {
          alert('Fehler beim Erstellen der Bestellung: ' + (orderData.error || 'Unbekannter Fehler'))
          console.error('Order creation failed:', orderData)
          return
        }

        const orderId = orderData.orderId
        console.log('Order created with ID:', orderId)

        const stripeRes = await fetch('php/create-checkout-session.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cart: this.cart,
            orderId: orderId,
            total: this.cartGrossPrice
          })
        })

        console.log('Stripe response status:', stripeRes.status)
        const stripeData = await stripeRes.json()
        console.log('Stripe response data:', stripeData)

        if (!stripeRes.ok) {
          alert('Fehler bei Stripe: ' + (stripeData.error || 'Unbekannter Fehler'))
          console.error('Stripe creation failed:', stripeData)
          return
        }

        sessionStorage.setItem('orderId', orderId)
        console.log('Redirecting to Stripe:', stripeData.url)
        window.location.href = stripeData.url
      } catch (error) {
        console.error('=== EXCEPTION IN PAY ===', error)
        alert('Ein Fehler ist aufgetreten: ' + error.message)
      }
    }
  },

  mounted() {
    console.log('Cart component mounted')
    const c = localStorage.getItem('cart')
    if (c) this.cart = JSON.parse(c)
  }
}).mount('#page-cart')