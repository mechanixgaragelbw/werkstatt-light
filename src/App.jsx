import { useMemo, useState } from "react"

export default function App() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    vehicle: "",
    plate: "",
    bay: "",
    acceptedRules: false,
    acceptedLiability: false,
  })

  const [customers, setCustomers] = useState([])
  const [scanning, setScanning] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setForm((p) => ({
        ...p,
        vehicle: "BMW 320d",
        plate: "PRZ-WK 456",
      }))
      setScanning(false)
    }, 1000)
  }

  const handleSubmit = () => {
    if (!form.name || !form.acceptedRules || !form.acceptedLiability) return

    setCustomers([
      {
        ...form,
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
      },
      ...customers,
    ])

    setForm({
      name: "",
      address: "",
      vehicle: "",
      plate: "",
      bay: "",
      acceptedRules: false,
      acceptedLiability: false,
    })
  }

  const activeBays = useMemo(() => {
    return customers.reduce((acc, c) => {
      if (c.bay) acc[c.bay] = (acc[c.bay] || 0) + 1
      return acc
    }, {})
  }, [customers])

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Werkstatt Light System</h1>

      <input placeholder="Name" name="name" value={form.name} onChange={handleChange} />
      <br />
      <input placeholder="Adresse" name="address" value={form.address} onChange={handleChange} />
      <br />

      <input placeholder="Fahrzeug" name="vehicle" value={form.vehicle} onChange={handleChange} />
      <button onClick={handleScan}>{scanning ? "Scanne..." : "Scan"}</button>
      <br />

      <input placeholder="Kennzeichen" name="plate" value={form.plate} onChange={handleChange} />
      <br />

      <select name="bay" value={form.bay} onChange={handleChange}>
        <option value="">Bühne wählen</option>
        <option value="Service 1">Service 1</option>
        <option value="Service 2">Service 2</option>
        <option value="DIY 1">DIY 1</option>
        <option value="DIY 2">DIY 2</option>
        <option value="DIY 3">DIY 3</option>
      </select>

      <br /><br />

      <label>
        <input
          type="checkbox"
          name="acceptedRules"
          checked={form.acceptedRules}
          onChange={handleChange}
        /> Regeln akzeptiert
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          name="acceptedLiability"
          checked={form.acceptedLiability}
          onChange={handleChange}
        /> Haftung akzeptiert
      </label>

      <br /><br />

      <button onClick={handleSubmit}>Kunde anmelden</button>

      <hr />

      <h3>Aktive Kunden: {customers.length}</h3>

      <h3>Bühnen</h3>
      {Object.entries(activeBays).map(([bay, count]) => (
        <div key={bay}>{bay}: {count}</div>
      ))}

      <hr />

      <h3>Kundenliste</h3>
      {customers.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", margin: 5, padding: 5 }}>
          <b>{c.name}</b> - {c.vehicle} ({c.plate}) | Bühne: {c.bay} | {c.time}
        </div>
      ))}
    </div>
  )
}
