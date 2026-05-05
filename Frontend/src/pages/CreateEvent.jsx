import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import EventForm from '../components/EventForm'
import { createEventApi } from '../services/event.api'

export default function CreateEvent() {
  const navigate = useNavigate()

  const [zones, setZones] = useState([
    { name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }
  ])

  const defaultZone = { name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }

  const validateZones = () => {
    if (zones.length === 0) return 'At least one seating zone is required!'

    const zoneNames = new Set()

    for (let index = 0; index < zones.length; index++) {
      const zone = zones[index]
      const zoneName = zone.name.trim()

      if (!zoneName) return `Zone name in row ${index + 1} cannot be empty!`
      if (Number(zone.rows) <= 0 || Number(zone.seats_per_row) <= 0) {
        return `Zone "${zoneName}" must have at least 1 row and 1 seat!`
      }
      if (Number(zone.price) < 0) {
        return `Ticket price for zone "${zoneName}" cannot be negative!`
      }
      if (zoneNames.has(zoneName.toLowerCase())) {
        return `Zone name "${zoneName}" is duplicated!`
      }

      zoneNames.add(zoneName.toLowerCase())
    }

    return ''
  }

  const handleSubmit = async ({ form, bannerFile }) => {
    const formData = new FormData()

    Object.keys(form).forEach((key) => {
      if (!form[key]) return
      if (['event_date', 'sale_start_at', 'sale_end_at'].includes(key)) {
        formData.append(key, new Date(form[key]).toISOString())
      } else {
        formData.append(key, form[key])
      }
    })

    const formattedZones = zones.map((zone) => ({
      name: zone.name,
      rows: Number(zone.rows),
      seats_per_row: Number(zone.seats_per_row),
      price: Number(zone.price),
      color_hex: zone.color_hex,
    }))

    formData.append('zones', JSON.stringify(formattedZones))

    if (bannerFile) {
      formData.append('banner', bannerFile)
    }

    await createEventApi(formData)
    navigate('/admin/events')
  }

  return (
    <EventForm
      title="Create New Event"
      submitLabel="Save Event & Create Seating Map"
      submitLoadingLabel="Creating seat matrix..."
      extraValidate={validateZones}
      onSubmit={handleSubmit}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Seat Layout Configuration (Zones)</h3>
          <button type="button" onClick={() => setZones((prev) => [...prev, { ...defaultZone }])} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
            + Add Zone
          </button>
        </div>

        {zones.map((zone, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 items-end bg-violet-50 p-4 rounded-lg mb-4 border border-violet-100 relative">
            {zones.length > 1 && (
              <button type="button" onClick={() => setZones((prev) => prev.filter((_, i) => i !== index))} className="absolute top-2 right-3 text-red-500 font-bold hover:text-red-700">
                X
              </button>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Zone Name (e.g. VIP, ZONE A)</label>
              <input name="name" value={zone.name} onChange={(e) => { const nextZones = [...zones]; nextZones[index].name = e.target.value; setZones(nextZones) }} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Rows</label>
              <input name="rows" type="number" min="1" value={zone.rows} onChange={(e) => { const nextZones = [...zones]; nextZones[index].rows = e.target.value; setZones(nextZones) }} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Seats/Row</label>
              <input name="seats_per_row" type="number" min="1" value={zone.seats_per_row} onChange={(e) => { const nextZones = [...zones]; nextZones[index].seats_per_row = e.target.value; setZones(nextZones) }} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (VND)</label>
              <input name="price" type="number" min="0" value={zone.price} onChange={(e) => { const nextZones = [...zones]; nextZones[index].price = e.target.value; setZones(nextZones) }} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Color</label>
              <input name="color_hex" type="color" value={zone.color_hex} onChange={(e) => { const nextZones = [...zones]; nextZones[index].color_hex = e.target.value; setZones(nextZones) }} required className="w-full h-[42px] p-1 border rounded-md cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </EventForm>
  )
}