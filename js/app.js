/**
 * APP.JS - Hauptlogik für die Index-Seite (Produktkatalog)
 * 
 * Funktionen:
 * - Laden und Anzeigen von Produkten aus der Datenbank
 * - Warenkorb-Management (Hinzufügen/Entfernen von Produkten)
 * - Lagerbestandskontrolle
 * - Preisberechnung mit 7% MwSt
 * - Navigation zu Login und Admin-Bereich
 */

const { createApp } = Vue;

createApp({
  // ===== DATEN-EIGENSCHAFTEN =====
  data() {
    return {
      title: 'Weihnachtsgeschenke-Shop',
      search: '',           // Suchbegriff für Produktfilter
      products: [],         // Liste aller Produkte aus DB
      cart: [],            // Warenkorb (gespeichert in localStorage)
      messages: [],        // Fehlermeldungen/Benachrichtigungen
      isAdmin: false       // Admin-Status (aktuell nicht verwendet)
    };
  },

  // ===== BERECHNETE EIGENSCHAFTEN =====
  computed: {
    // Filtert Produkte basierend auf Suchbegriff
    filteredProducts() {
      return this.products.filter(p =>
        p.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    // Berechnet Netto-Gesamtpreis (ohne MwSt)
    cartNetPrice() {
      return this.cart.reduce(
        (s, i) => s + Number(i.price) * i.quantity,
        0
      );
    },

    // Berechnet 7% Mehrwertsteuer
    cartVat() {
      return this.cartNetPrice * 0.07;
    },

    // Berechnet Brutto-Gesamtpreis (mit MwSt)
    cartGrossPrice() {
      return this.cartNetPrice + this.cartVat;
    },

    // Zählt Gesamtanzahl der Artikel im Warenkorb
    cartTotalItems() {
      return this.cart.reduce((s, i) => s + i.quantity, 0);
    },

    // Zählt Anzahl verschiedener Produktpositionen
    cartTotalPositions() {
      return this.cart.length;
    }
  },

  // ===== METHODEN =====
  methods: {
    /**
     * Zeigt eine Nachricht für 3 Sekunden an
     * @param {string} msg - Die anzuzeigende Nachricht
     */
    addMessage(msg) {
      console.log('Message added:', msg);
      this.messages.push(msg);
      setTimeout(() => this.messages.shift(), 3000);
    },

    /**
     * Fügt ein Produkt zum Warenkorb hinzu
     * Prüft Lagerbestand und zeigt Fehler bei Überschreitung
     * @param {Object} product - Das hinzuzufügende Produkt
     */
    orderProduct(product) {
      console.log('orderProduct called for:', product.title, 'stock:', product.stock);
      const stock = Number(product.stock) || 0;
      
      // Prüfung: Produkt auf Lager?
      if (stock <= 0) {
        this.addMessage('Produkt nicht mehr verfügbar');
        return;
      }

      const item = this.cart.find(p => p.id === product.id);
      const currentQuantity = item ? item.quantity : 0;
      const requestedQuantity = currentQuantity + 1;

      console.log('currentQuantity:', currentQuantity, 'requested:', requestedQuantity, 'stock:', stock);

      // Prüfung: Genug Lagerbestand?
      if (requestedQuantity > stock) {
        this.addMessage(`Nur ${stock} Stück verfügbar. Du versuchst ${requestedQuantity} hinzuzufügen.`);
        return;
      }

      // Produkt bereits im Warenkorb? -> Anzahl erhöhen
      if (item) {
        item.quantity++;
      } else {
        // Neues Produkt zum Warenkorb hinzufügen
        this.cart.push({
          id: product.id,
          title: product.title,
          price: Number(product.price),
          quantity: 1,
          stock: stock
        });
      }
    },

    /**
     * Entfernt ein Produkt aus dem Warenkorb oder reduziert die Anzahl
     * @param {Object} product - Das zu entfernende Produkt
     */
    removeProduct(product) {
      const item = this.cart.find(p => p.id === product.id);
      if (!item) return;

      item.quantity--;
      // Wenn Anzahl = 0, komplett aus Warenkorb entfernen
      if (item.quantity === 0) {
        this.cart = this.cart.filter(p => p.id !== product.id);
      }
    },

    /**
     * Navigation zum Admin-Bereich
     * Prüft ob Benutzer eingeloggt und Admin ist
     */
    goToAdmin() {
      let user = null;

      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch {
        localStorage.removeItem('user');
      }

      // Nicht eingeloggt? -> Zur Login-Seite
      if (!user) {
        window.location.href = 'auth.html';
        return;
      }

      // Kein Admin? -> Fehlermeldung
      if (user.role !== 'admin') {
        this.addMessage('Kein Admin-Zugriff');
        return;
      }

      window.location.href = 'admin.html';
    },

    /**
     * Navigation zur Login-Seite
     */
    goToLogin() {
      window.location.href = 'auth.html';
    },

    /**
     * Logout: Entfernt Benutzerdaten und leitet zur Login-Seite
     */
    logout() {
      try {
        localStorage.removeItem('user');
      } catch (e) {
        // Private mode might block localStorage
      }
      window.location.href = 'auth.html';
    }
  },

  // ===== LIFECYCLE: MOUNTED =====
  // Wird ausgeführt wenn die Komponente geladen ist
  mounted() {
    // Produkte von PHP-Backend laden
    fetch('php/products.php')
      .then(r => r.json())
      .then(d => {
        this.products = d.map(p => ({
          ...p,
          price: Number(p.price),
          stock: p.stock ? Number(p.stock) : 0
        }));
      });

    // Gespeicherten Warenkorb aus localStorage laden
    let savedCart = [];

    try {
      savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      localStorage.removeItem('cart');
    }

    // Nur gültige Warenkorb-Einträge übernehmen
    this.cart = savedCart.filter(
      i => i && !isNaN(i.price) && !isNaN(i.quantity)
    );
  },

  // ===== WATCHER =====
  // Speichert Warenkorb automatisch bei jeder Änderung
  watch: {
    cart: {
      deep: true,
      handler(v) {
        localStorage.setItem('cart', JSON.stringify(v));
      }
    }
  }
}).mount('#page-catalog');
