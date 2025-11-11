import { useState, useEffect, useMemo } from 'react'
import SectionHeader from '../components/SectionHeader'
import { api } from '../lib/api'

export default function Booking(){
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedTable, setSelectedTable] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [totalPayment, setTotalPayment] = useState('')
  const [advancePayment, setAdvancePayment] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [timeSlots, setTimeSlots] = useState([])
  const [slotsError, setSlotsError] = useState('')
  const [tableWarning, setTableWarning] = useState('')

  // Set default dates to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
  }, [])

  // Fetch available time slots when startDate changes
  useEffect(() => {
    if (startDate) {
      fetchTimeSlots()
    }
  }, [startDate])

  async function fetchTimeSlots() {
    try {
      setLoadingSlots(true)
      setSlotsError('')
      const data = await api.getAvailableTimeSlots(startDate)
      
      // Filter out past time slots
      const now = new Date()
      const isToday = startDate === now.toISOString().split('T')[0]
      
      let filteredSlots = data.timeSlots || []
      
      if (isToday) {
        filteredSlots = filteredSlots.filter(slot => {
          // Skip slots marked as past by backend
          if (slot.isPast) return false
          
          // Double-check on frontend
          const [hours, minutes] = slot.time.split(':').map(Number)
          const slotTime = new Date()
          slotTime.setHours(hours, minutes, 0, 0)
          
          return slotTime > now
        })
      }
      
      // Only show available slots (not fully booked)
      filteredSlots = filteredSlots.filter(slot => slot.available !== false)
      
      // Ensure all slots have availableTables and bookedTables arrays
      // If backend doesn't provide them, use default empty arrays
      filteredSlots = filteredSlots.map(slot => ({
        ...slot,
        availableTables: slot.availableTables || [], // Default to empty array if not provided
        bookedTables: slot.bookedTables || [], // Default to empty array if not provided
      }))
      
      // Debug: Log first slot to see data structure
      if (filteredSlots.length > 0) {
        console.log('Sample slot data:', JSON.stringify(filteredSlots[0], null, 2))
      }
      
      setTimeSlots(filteredSlots)
      
      // Check if we're using fallback data
      if (data && data.fallbackMode) {
        if (data.usingRealReservations) {
          console.log('🎯 Using enhanced fallback mode with REAL reservation data')
          console.log('Real bookings from database are being applied to time slots')
        } else {
          console.log('🔧 Using fallback mode with simulated data')
          console.log('Backend routing issue prevents real-time availability checking')
        }
        // Clear any error messages since fallback is working
        setSlotsError('')
      } else if (data && data.timeSlots && data.timeSlots.length > 0 && data.bookedSlots === 0) {
        console.log('Using fallback time slots - basic mode')
        setSlotsError('') // Clear any previous errors
      }
    } catch (error) {
      setSlotsError(error?.message || 'Failed to load available time slots')
      setTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  async function submit(){
    setMessage('')
    if (!startDate || !endDate || !selectedTimeSlot || !name) {
      setMessage('Please select start date, end date, time slot, and enter your name.')
      return
    }
    if (!selectedTable) {
      setMessage('Please select a table.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setMessage('End date must be on or after start date.')
      return
    }
    try {
      setSaving(true)
      await api.createReservation({ 
        startDate,
        endDate,
        time: selectedTimeSlot.time, 
        guests, 
        customerName: name, 
        contact, 
        notes,
        tableNumber: selectedTable,
        totalPayment: totalPayment ? parseFloat(totalPayment) : 0,
        advancePayment: advancePayment ? parseFloat(advancePayment) : 0
      })
      setMessage('Reservation booked successfully!')
      // Reset form
      setName('')
      setContact('')
      setNotes('')
      setTotalPayment('')
      setAdvancePayment('')
      setSelectedTimeSlot(null)
      setSelectedTable('')
      // Refresh time slots to show updated availability
      await fetchTimeSlots()
    } catch (e) {
      console.error('Booking error:', e)
      // Try to parse error message from response
      let errorMsg = 'Failed to create reservation'
      if (e?.message) {
        try {
          const parsed = JSON.parse(e.message)
          errorMsg = parsed.message || e.message
        } catch {
          errorMsg = e.message
        }
      }
      setMessage(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0]

  // Get maximum date (30 days from now)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateString = maxDate.toISOString().split('T')[0]

  return (
    <div className="section py-12 space-y-10">
      <SectionHeader title="Reserve a table" subtitle="Book your preferred time slot and table. Available slots are shown in real-time."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: form */}
        <div className="card p-6 space-y-6 lg:col-span-2">
          {/* Start Date Selection */}
          <div>
            <label className="text-sm text-stone-600 font-medium">Start Date *</label>
            <input 
              type="date" 
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              min={minDate}
              max={maxDateString}
            />
            <p className="text-xs text-stone-500 mt-1">You can book up to 30 days in advance</p>
          </div>

          {/* End Date Selection */}
          <div>
            <label className="text-sm text-stone-600 font-medium">End Date *</label>
            <input 
              type="date" 
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              min={startDate || minDate}
              max={maxDateString}
            />
            <p className="text-xs text-stone-500 mt-1">End date must be on or after start date</p>
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-sm text-stone-600 font-medium">Available Time Slots</label>
            {loadingSlots && (
              <div className="mt-2 p-4 bg-stone-50 rounded-xl">
                <p className="text-stone-600">Loading available time slots...</p>
              </div>
            )}
            {slotsError && (
              <div className="mt-2 p-4 bg-red-50 rounded-xl">
                <p className="text-red-600">{slotsError}</p>
              </div>
            )}
            {!loadingSlots && !slotsError && timeSlots.length === 0 && (
              <div className="mt-2 p-4 bg-yellow-50 rounded-xl">
                <p className="text-yellow-600">No available time slots for this date</p>
              </div>
            )}
            {!loadingSlots && !slotsError && timeSlots.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedTimeSlot(slot)
                      setSelectedTable('') // Reset table selection
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      selectedTimeSlot?.time === slot.time
                        ? 'bg-brand-600 text-white border-brand-600 shadow-lg'
                        : 'bg-white hover:bg-brand-50 border-stone-300 hover:border-brand-300'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table Selection Info */}
          {selectedTimeSlot && (
            <div className="animate-slide-up">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Table Selection</h4>
                <p className="text-xs text-blue-600 mb-2">
                  Select your preferred table from the layout on the right. Available tables are shown in green, booked tables in gray.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    {(selectedTimeSlot.availableTables || []).length} Available
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {(selectedTimeSlot.bookedTables || []).length} Booked
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Guest Selection */}
          <div>
            <label className="text-sm text-stone-600 font-medium">Number of Guests</label>
            <select 
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" 
              value={guests} 
              onChange={e => setGuests(Number(e.target.value))}
            >
              {Array.from({length: 10}, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-stone-600 font-medium">Full Name *</label>
              <input 
                className="w-full rounded-xl border border-stone-300 px-3 py-2" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 font-medium">Contact Information *</label>
              <input 
                className="w-full rounded-xl border border-stone-300 px-3 py-2" 
                placeholder="Phone number or email" 
                value={contact} 
                onChange={e => setContact(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 font-medium">Total Payment</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-stone-300 px-3 py-2" 
                placeholder="Enter total payment amount" 
                value={totalPayment} 
                onChange={e => setTotalPayment(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 font-medium">Advance Payment</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-stone-300 px-3 py-2" 
                placeholder="Enter advance payment amount" 
                value={advancePayment} 
                onChange={e => setAdvancePayment(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 font-medium">Special Requests (Optional)</label>
              <textarea 
                className="w-full rounded-xl border border-stone-300 px-3 py-2" 
                placeholder="Any special requests or dietary requirements"
                rows={3}
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>
          </div>

          {/* Booking Summary */}
          {selectedTimeSlot && selectedTable && (
            <div className="bg-brand-50 rounded-xl p-4 animate-slide-up">
              <h4 className="font-medium text-brand-800 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-brand-700">
                <p><span className="font-medium">Start Date:</span> {new Date(startDate).toLocaleDateString()}</p>
                <p><span className="font-medium">End Date:</span> {new Date(endDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {selectedTimeSlot.time}</p>
                <p><span className="font-medium">Table:</span> {selectedTable}</p>
                <p><span className="font-medium">Guests:</span> {guests}</p>
                {totalPayment && <p><span className="font-medium">Total Payment:</span> ₹{parseFloat(totalPayment).toFixed(2)}</p>}
                {advancePayment && <p><span className="font-medium">Advance Payment:</span> ₹{parseFloat(advancePayment).toFixed(2)}</p>}
              </div>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <button 
            className="btn btn-primary w-full sm:w-auto" 
            onClick={submit} 
            disabled={saving || !selectedTimeSlot || !selectedTable || !name || !contact || !startDate || !endDate}
          >
            {saving ? 'Booking...' : 'Confirm Reservation'}
          </button>
        </div>

        {/* Right: Interactive Table Layout */}
        <div className="card p-6">
          <h3 className="font-medium mb-4">Restaurant Table Layout</h3>
          
          {!selectedTimeSlot ? (
            <div className="text-center py-8">
              <p className="text-stone-500 text-sm">Select a time slot to see table availability</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-brand-50 rounded-lg">
                <p className="text-sm font-medium text-brand-800">
                  Time Slot: {selectedTimeSlot.time}
                </p>
                <p className="text-xs text-brand-600">
                  Available: {(selectedTimeSlot.availableTables || []).length} tables | 
                  Booked: {(selectedTimeSlot.bookedTables || []).length} tables
                </p>
              </div>
              
              {/* Table Grid Layout */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {Array.from({length: 20}, (_, i) => i + 1).map(n => {
                  const tableId = `T${n}`
                  const availableTables = selectedTimeSlot.availableTables || []
                  const bookedTables = selectedTimeSlot.bookedTables || []
                  const isBooked = bookedTables.includes(tableId)
                  const isSelected = selectedTable === tableId
                  // If no availableTables array, assume all tables are available unless booked
                  const isAvailable = availableTables.length > 0 
                    ? availableTables.includes(tableId)
                    : !isBooked
                  
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        if (isAvailable && !isBooked) {
                          setSelectedTable(tableId)
                          setTableWarning('')
                        } else if (isBooked) {
                          setTableWarning(`Table ${tableId} is already booked for ${selectedTimeSlot.time}. Please choose another table.`)
                          setTimeout(() => setTableWarning(''), 3000)
                        }
                      }}
                      disabled={isBooked}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-medium ${
                        isSelected 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-lg transform scale-105 table-selected'
                          : isBooked 
                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed table-booked'
                            : isAvailable
                              ? 'bg-green-50 text-green-700 border-green-300 cursor-pointer table-available'
                              : 'bg-stone-50 text-stone-500 border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{tableId}</div>
                        {isBooked && (
                          <div className="text-xs opacity-75">Booked</div>
                        )}
                        {isSelected && (
                          <div className="text-xs opacity-90">Selected</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {/* Table Status Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                  <span className="text-stone-600">Available - Click to select</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-stone-600">Booked - Not available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-brand-600 rounded"></div>
                  <span className="text-stone-600">Selected - Your choice</span>
                </div>
              </div>
              
              {/* Table Warning */}
              {tableWarning && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg animate-slide-up border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ {tableWarning}
                  </p>
                </div>
              )}
              
              {/* Selected Table Info */}
              {selectedTable && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg animate-slide-up">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Table {selectedTable} selected
                  </p>
                  <p className="text-xs text-green-600">
                    Ready for {guests} {guests === 1 ? 'guest' : 'guests'} at {selectedTimeSlot.time}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
