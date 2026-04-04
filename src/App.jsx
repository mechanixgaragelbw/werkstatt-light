import { useEffect, useState } from "react"

const bays = ["Service 1", "Service 2", "DIY 1", "DIY 2", "DIY 3"]
const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`)

const getRate = (bay) => {
  if (!bay) return 0
  if (bay.includes("Service")) return 90
  if (bay.includes("DIY")) return 15
  return 30
}

export default function App() {
  const [mode, setMode] = useState("admin")
  const [bookings, setBookings] = useState([])

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>MechanixGarageLbw</h1>

      <button onClick={() => setMode("admin")}>Admin</button>
      <button onClick={() => setMode("customer")} style={{ marginLeft: 10 }}>
        Kunde
      </button>

      <hr />

      {mode === "admin" ? (
        <AdminView bookings={bookings} />
      ) : (
        <CustomerView bookings={bookings} setBookings={setBookings} />
      )}
    </div>
  )
}

function AdminView({ bookings }) {
  return (
    <div>
      <h2>Admin Ansicht</h2>
      <div style={{ display: "grid", gridTemplateColumns: "100px repeat(10, 1fr)", gap: 5 }}>
        <div></div>
        {timeSlots.map((t) => (
          <div key={t} style={{ fontWeight: "bold" }}>{t}</div>
        ))}

        {bays.map((bay) => (
          <>
            <div style={{ fontWeight: "bold" }}>{bay}</div>
            {timeSlots.map((t) => {
              const booking = bookings.find(
                (b) => b.bay === bay && b.slots.includes(t)
              )

              return (
                <div key={t} style={{ border: "1px solid #ccc", height: 40, background: booking ? "#ffcccc" : "#ccffcc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {booking ? `${booking.name} (${booking.cost}€)` : "frei"}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

function CustomerView({ bookings, setBookings }) {
  const [form, setForm] = useState({
    name: "",
    bay: "",
    start: "",
    duration: 1,
  })

  const [price, setPrice] = useState(0)

  useEffect(() => {
    if (form.bay && form.duration) {
      setPrice(getRate(form.bay) * form.duration)
    }
  }, [form])

  useEffect(() => {
    if (!window.paypal || !price) return

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: price.toString() } }]
        })
      },
      onApprove: async (data, actions) => {
        await actions.order.capture()

        const startIndex = timeSlots.indexOf(form.start)
        const slots = timeSlots.slice(startIndex, startIndex + Number(form.duration))

        setBookings([
          ...bookings,
          { ...form, slots, cost: price, id: Date.now() }
        ])

        alert("Zahlung erfolgreich & gebucht!")

        setForm({ name: "", bay: "", start: "", duration: 1 })
      }
    }).render("#paypal-button-container")

  }, [price])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleBooking = (bay, time) => {
    setForm({ ...form, bay, start: time })
  }

  return (
    <div>
      <h2>Kunden Buchung</h2>

      <input placeholder="Name" name="name" value={form.name} onChange={handleChange} />

      <select name="duration" value={form.duration} onChange={handleChange}>
        <option value={1}>1h</option>
        <option value={2}>2h</option>
        <option value={3}>3h</option>
      </select>

      <p>Preis: {price} €</p>

      <p>Gewählt: {form.bay} {form.start}</p>

      <div id="paypal-button-container" style={{ marginTop: 10 }}></div>

      <hr />

      <div style={{ display: "grid", gridTemplateColumns: "100px repeat(10, 1fr)", gap: 5 }}>
        <div></div>
        {timeSlots.map((t) => (
          <div key={t}>{t}</div>
        ))}

        {bays.map((bay) => (
          <>
            <div>{bay}</div>
            {timeSlots.map((t) => {
              const booked = bookings.some(
                (b) => b.bay === bay && b.slots.includes(t)
              )

              return (
                <div
                  key={t}
                  onClick={() => !booked && handleBooking(bay, t)}
                  style={{
                    border: "1px solid #ccc",
                    height: 40,
                    background: booked ? "#ffcccc" : "#ccffcc",
                    cursor: booked ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                  }}
                >
                  {booked ? "belegt" : "frei"}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
