/**
 * CART.JS - Logik für die Warenkorb-Seite
 * 
 * Funktionen:
 * - Anzeige und Verwaltung des Warenkorbs
 * - Änderung von Produktmengen mit Lagerbestandskontrolle
 * - Preisberechnung (Netto + 7% MwSt = Brutto)
 * - Initiierung des Zahlungsvorgangs über Stripe
 * - Zwei-Schritt-Prozess: 1) Bestellung erstellen 2) Stripe Checkout
 */

const { createApp } = Vue

createApp({
  // ===== DATEN-EIGENSCHAFTEN =====
  data() {
    return {
      cart: [],        // Warenkorb aus localStorage
      messages: []     // Fehlermeldungen/Benachrichtigungen
    }
  },

  // ===== BERECHNETE EIGENSCHAFTEN =====
  computed: {
    // Berechnet Netto-Gesamtpreis (ohne MwSt)
    cartNetPrice() {
      return this.cart.reduce((s, i) => s + i.price * i.quantity, 0)
    },
    
    // Berechnet 7% Mehrwertsteuer
    cartVat() {
      return this.cartNetPrice * 0.07
    },
    
    // Berechnet Brutto-Gesamtpreis (mit MwSt)
    cartGrossPrice() {
      return this.cartNetPrice + this.cartVat
    }
  },

  // ===== METHODEN =====
  methods: {
    /**
     * Zeigt eine Nachricht für 3 Sekunden an
     * @param {string} msg - Die anzuzeigende Nachricht
     */
    addMessage(msg) {
      this.messages.push(msg);
      setTimeout(() => this.messages.shift(), 3000);
    },

    /**
     * Erhöht die Menge eines Produkts im Warenkorb
     * Prüft vorher den Lagerbestand
     * @param {Object} item - Das Warenkorb-Item
     */
    orderProduct(item) {
      // Lagerbestand prüfen
      if (item.quantity >= item.stock) {
        this.addMessage(`Nur ${item.stock} Stück verfügbar. Du versuchst ${item.quantity + 1} hinzuzufügen.`);
        return;
      }
      item.quantity++
      this.saveCart()
    },

    /**
     * Reduziert die Menge eines Produkts oder entfernt es komplett
     * @param {Object} item - Das Warenkorb-Item
     */
    removeProduct(item) {
      item.quantity--
      // Bei Menge = 0 komplett aus Warenkorb entfernen
      if (item.quantity === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id)
      }
      this.saveCart()
    },

    /**
     * Speichert Warenkorb in localStorage
     */
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },

    /**
     * ZAHLUNGSPROZESS (Zwei Schritte)
     * 
     * Schritt 1: Bestellung in Datenbank erstellen (order.php)
     * Schritt 2: Stripe Checkout Session erstellen (create-checkout-session.php)
     * Schritt 3: Weiterleitung zur Stripe-Zahlungsseite
     * 
     * Bei Erfolg: Weiterleitung zu success.php
     * Bei Abbruch: Zurück zu cart.html
     */
    async pay() {
      console.log('=== PAY FUNCTION STARTED ===')
      
      // ===== BENUTZER-VALIDIERUNG =====
      const userStr = localStorage.getItem('user')
      console.log('Raw user from localStorage:', userStr)
      
      const user = JSON.parse(userStr || 'null')
      console.log('Parsed user object:', user)
      console.log('user.id:', user?.id)
      console.log('Type of user.id:', typeof user?.id)
      
      // Nicht eingeloggt? -> Zur Login-Seite
      if (!user) {
        alert('Bitte melden Sie sich zuerst an')
        window.location.href = 'auth.html'
        return
      }

      // User-ID fehlt? -> Fehler (sollte nicht passieren)
      if (!user.id) {
        alert('Fehler: Benutzer-ID nicht gefunden. Bitte melden Sie sich ab und neu an.')
        console.error('User object missing id:', user)
        return
      }

      // Warenkorb leer? -> Fehler
      if (this.cart.length === 0) {
        alert('Warenkorb ist leer')
        return
      }

      try {
        // ===== SCHRITT 1: BESTELLUNG IN DB ERSTELLEN =====
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

        // Bestellung fehlgeschlagen?
        if (!orderRes.ok) {
          alert('Fehler beim Erstellen der Bestellung: ' + (orderData.error || 'Unbekannter Fehler'))
          console.error('Order creation failed:', orderData)
          return
        }

        const orderId = orderData.orderId
        console.log('Order created with ID:', orderId)

        // ===== SCHRITT 2: STRIPE CHECKOUT SESSION ERSTELLEN =====
        const stripeRes = await fetch('php/create-checkout-session.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cart: this.cart,
            orderId: orderId,
            total: this.cartGrossPrice  // Exakter Gesamtpreis inkl. MwSt
          })
        })

        console.log('Stripe response status:', stripeRes.status)
        const stripeData = await stripeRes.json()
        console.log('Stripe response data:', stripeData)

        // Stripe-Session-Erstellung fehlgeschlagen?
        if (!stripeRes.ok) {
          alert('Fehler bei Stripe: ' + (stripeData.error || 'Unbekannter Fehler'))
          console.error('Stripe creation failed:', stripeData)
          return
        }

        // ===== SCHRITT 3: WEITERLEITUNG ZU STRIPE =====
        sessionStorage.setItem('orderId', orderId)  // OrderId für success.php speichern
        console.log('Redirecting to Stripe:', stripeData.url)
        window.location.href = stripeData.url  // Zur Stripe-Zahlungsseite
      } catch (error) {
        console.error('=== EXCEPTION IN PAY ===', error)
        alert('Ein Fehler ist aufgetreten: ' + error.message)
      }
    }
  },

  // ===== LIFECYCLE: MOUNTED =====
  // Lädt gespeicherten Warenkorb aus localStorage
  mounted() {
    console.log('Cart component mounted')
    const c = localStorage.getItem('cart')
    if (c) this.cart = JSON.parse(c)
  }
}).mount('#page-cart')