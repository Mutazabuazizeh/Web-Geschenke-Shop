const { createApp } = Vue;

createApp({
  data() {
    return {
      title: 'Weihnachtsgeschenke-Shop',
      search: '',
      products: [],
      cart: [],
      messages: [],
      isAdmin: false
    };
  },

  computed: {
    filteredProducts() {
      return this.products.filter(p =>
        p.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    cartNetPrice() {
      return this.cart.reduce(
        (s, i) => s + Number(i.price) * i.quantity,
        0
      );
    },

    cartVat() {
      return this.cartNetPrice * 0.07;
    },

    cartGrossPrice() {
      return this.cartNetPrice + this.cartVat;
    },

    cartTotalItems() {
      return this.cart.reduce((s, i) => s + i.quantity, 0);
    },

    cartTotalPositions() {
      return this.cart.length;
    }
  },

  methods: {
    addMessage(msg) {
      console.log('Message added:', msg);
      this.messages.push(msg);
      setTimeout(() => this.messages.shift(), 3000);
    },

    orderProduct(product) {
      console.log('orderProduct called for:', product.title, 'stock:', product.stock);
      const stock = Number(product.stock) || 0;
      
      if (stock <= 0) {
        this.addMessage('Produkt nicht mehr verfügbar');
        return;
      }

      const item = this.cart.find(p => p.id === product.id);
      const currentQuantity = item ? item.quantity : 0;
      const requestedQuantity = currentQuantity + 1;

      console.log('currentQuantity:', currentQuantity, 'requested:', requestedQuantity, 'stock:', stock);

      if (requestedQuantity > stock) {
        this.addMessage(`Nur ${stock} Stück verfügbar. Du versuchst ${requestedQuantity} hinzuzufügen.`);
        return;
      }

      if (item) {
        item.quantity++;
      } else {
        this.cart.push({
          id: product.id,
          title: product.title,
          price: Number(product.price),
          quantity: 1,
          stock: stock
        });
      }
    },

    removeProduct(product) {
      const item = this.cart.find(p => p.id === product.id);
      if (!item) return;

      item.quantity--;
      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== product.id);
      }
    },

    goToAdmin() {
      let user = null;

      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch {
        localStorage.removeItem('user');
      }

      if (!user) {
        window.location.href = 'auth.html';
        return;
      }

      if (user.role !== 'admin') {
        this.addMessage('Kein Admin-Zugriff');
        return;
      }

      window.location.href = 'admin.html';
    },

    goToLogin() {
      window.location.href = 'auth.html';
    },

    logout() {
      try {
        localStorage.removeItem('user');
      } catch (e) {
        // Private mode might block localStorage
      }
      window.location.href = 'auth.html';
    }
  },

  mounted() {
    fetch('php/products.php')
      .then(r => r.json())
      .then(d => {
        this.products = d.map(p => ({
          ...p,
          price: Number(p.price),
          stock: p.stock ? Number(p.stock) : 0
        }));
      });

    let savedCart = [];

    try {
      savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      localStorage.removeItem('cart');
    }

    this.cart = savedCart.filter(
      i => i && !isNaN(i.price) && !isNaN(i.quantity)
    );
  },

  watch: {
    cart: {
      deep: true,
      handler(v) {
        localStorage.setItem('cart', JSON.stringify(v));
      }
    }
  }
}).mount('#page-catalog');
