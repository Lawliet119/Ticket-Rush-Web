import { useEffect, useState } from 'react'

const defaultForm = {
  title: '',
  description: '',
  venue: '',
  address: '',
  event_date: '',
  sale_start_at: '',
  sale_end_at: '',
}

function isImageFile(file) {
  return file && file.type && file.type.startsWith('image/')
}

function getValidationMessage(form, { enforceSaleStartInFuture = true } = {}) {
  if (!form.title.trim() || !form.venue.trim()) {
    return 'name and venue are required fields and cannot be empty!'
  }

  if (!form.event_date || !form.sale_start_at || !form.sale_end_at) {
    return 'Please fill in all required date and time fields!'
  }

  const now = new Date()
  const eventDate = new Date(form.event_date)
  const saleStart = new Date(form.sale_start_at)
  const saleEnd = new Date(form.sale_end_at)

  if (enforceSaleStartInFuture && saleStart < now) {
    return 'Sale start time cannot be in the past!'
  }

  if (saleStart >= saleEnd) {
    return 'Sale end time must be AFTER sale start time!'
  }

  if (saleStart >= eventDate) {
    return 'Sales must be opened BEFORE the event date!'
  }

  return ''
}

export default function EventForm({
  title,
  submitLabel,
  submitLoadingLabel,
  initialForm = defaultForm,
  initialBannerPreview = '',
  enforceSaleStartInFuture = true,
  extraValidate,
  onSubmit,
  children,
}) {
  const [form, setForm] = useState(initialForm)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(initialBannerPreview)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(initialForm)
    setBannerFile(null)
    setBannerPreview(initialBannerPreview || '')
    setError('')
  }, [initialForm, initialBannerPreview])

  useEffect(() => {
    return () => {
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview)
      }
    }
  }, [bannerPreview])

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const setPreviewFromFile = (file) => {
    if (!isImageFile(file)) {
      setError('Please only upload image files!')
      return
    }

    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPreviewFromFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) setPreviewFromFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const validationMessage = getValidationMessage(form, { enforceSaleStartInFuture })
    if (validationMessage) {
      setError(validationMessage)
      setLoading(false)
      return
    }

    if (typeof extraValidate === 'function') {
      const extraMessage = extraValidate({ form, bannerFile, bannerPreview })
      if (extraMessage) {
        setError(extraMessage)
        setLoading(false)
        return
      }
    }

    try {
      await onSubmit({ form, bannerFile, bannerPreview })
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Event Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Detailed description of the event..."
              className="w-full px-4 py-2 border rounded-lg resize-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Banner/Poster</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center w-full">
                {bannerPreview ? (
                  <div className="mb-4 relative inline-block">
                    <img
                      src={bannerPreview}
                      alt="Preview"
                      className="mx-auto max-h-64 object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null)
                        setBannerPreview('')
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="py-4 cursor-pointer"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Click to select image</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop here</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="e.g., 22 Nguyen Du, District 1, Ho Chi Minh City"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              name="event_date"
              type="datetime-local"
              value={form.event_date}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sale Start Date <span className="text-red-500">*</span>
            </label>
            <input
              name="sale_start_at"
              type="datetime-local"
              value={form.sale_start_at}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sale End Date <span className="text-red-500">*</span>
            </label>
            <input
              name="sale_end_at"
              type="datetime-local"
              value={form.sale_end_at}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {children}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
        >
          {loading ? submitLoadingLabel : submitLabel}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}