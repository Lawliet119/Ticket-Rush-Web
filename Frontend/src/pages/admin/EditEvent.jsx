import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EventForm from '../../components/EventForm'
import { updateEventApi, getEventDetailApi } from '../../services/event.api'

export default function EditEvent() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()

  const [initialForm, setInitialForm] = useState(null)
  const [initialBannerPreview, setInitialBannerPreview] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventDetailApi(eventId)
        const event = data.metadata
        setInitialForm({
          title: event.title || '',
          description: event.description || '',
          venue: event.venue || '',
          address: event.address || '',
          event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
          sale_start_at: event.sale_start_at ? new Date(event.sale_start_at).toISOString().slice(0, 16) : '',
          sale_end_at: event.sale_end_at ? new Date(event.sale_end_at).toISOString().slice(0, 16) : '',
        })
        setInitialBannerPreview(event.banner_url || '')
      } catch (err) {
        setInitialForm(null)
      } finally {
        setFetching(false)
      }
    }

    fetchEvent()
  }, [eventId])

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

    if (bannerFile) {
      formData.append('banner', bannerFile)
    }

    await updateEventApi(eventId, formData)
    navigate('/admin/events')
  }

  if (fetching) return <div className="text-center py-10">Loading...</div>
  if (!initialForm) return <div className="text-center py-10">Unable to load event data.</div>

  return (
    <EventForm
      title="Edit Event"
      submitLabel="Update Event"
      submitLoadingLabel="Updating..."
      initialForm={initialForm}
      initialBannerPreview={initialBannerPreview}
      enforceSaleStartInFuture={false}
      onSubmit={handleSubmit}
    />
  )
}