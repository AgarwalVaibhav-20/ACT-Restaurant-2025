import { useState, useEffect } from 'react'
import SectionHeader from '../components/SectionHeader'
import { api } from '../lib/api'
import { API_BASE_URL, RESTAURENT_ID } from '../lib/config'

export default function Booking(){
  const [selectedTable, setSelectedTable] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [totalPayment, setTotalPayment] = useState('')
  const [advancePayment, setAdvancePayment] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [tableWarning, setTableWarning] = useState('')
  const [tablesByFloor, setTablesByFloor] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [userStart, setUserStart] = useState('')
  const [userEnd, setUserEnd] = useState('')
  const [availableTablesData, setAvailableTablesData] = useState(null)
  const [loadingAvailableTables, setLoadingAvailableTables] = useState(false)
  const [availableTablesError, setAvailableTablesError] = useState('')

  // Set default datetimes (today, 1 hour from now to 2 hours from now)
  useEffect(() => {
    const now = new Date()
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatForInput = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    setUserStart(formatForInput(defaultStart))
    setUserEnd(formatForInput(defaultEnd))
  }, [])

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables()
  }, [])

  async function fetchTables() {
    try {
      setLoadingTables(true)
      const data = await api.getTables()
      const floors = data?.data || []
      setTablesByFloor(floors)
      // Auto-select first floor if available
      if (floors.length > 0) {
        const firstFloorId = floors[0].floorId?.toString() || floors[0].floorId
        setSelectedFloor(firstFloorId)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
      setTablesByFloor([])
    } finally {
      setLoadingTables(false)
    }
  }

  // Fetch available tables when userStart or userEnd changes
  useEffect(() => {
    if (userStart && userEnd) {
      fetchAvailableTables()
    }
  }, [userStart, userEnd])

  async function fetchAvailableTables() {
    try {
      setLoadingAvailableTables(true)
      setAvailableTablesError('')
      
      // Convert datetime-local format to ISO string
      const userStartISO = new Date(userStart).toISOString()
      const userEndISO = new Date(userEnd).toISOString()
      
      console.log('📅 Fetching available tables for:', userStartISO, 'to', userEndISO)
      
      const data = await api.getAvailableTables(userStartISO, userEndISO)
      setAvailableTablesData(data)
    } catch (error) {
      console.error('Error fetching available tables:', error)
      setAvailableTablesError(error?.message || 'Failed to load available tables')
      setAvailableTablesData(null)
    } finally {
      setLoadingAvailableTables(false)
    }
  }

  async function submit(){
    setMessage('')
    if (!userStart || !userEnd || !name) {
      setMessage('Please select start datetime, end datetime, and enter your name.')
      return
    }
    if (!selectedTable) {
      setMessage('Please select a table.')
      return
    }
    if (new Date(userEnd) <= new Date(userStart)) {
      setMessage('End datetime must be after start datetime.')
      return
    }
    try {
      setSaving(true)
      // Convert datetime-local to ISO format
      const startTimeISO = new Date(userStart).toISOString()
      const endTimeISO = new Date(userEnd).toISOString()
      
      // Use the new API format with startTime and endTime directly
      const baseUrl = API_BASE_URL || 'http://localhost:4000'
      const payload = {
        customerName: name || contact || 'Guest',
        startTime: startTimeISO,
        endTime: endTimeISO,
        tableNumber: selectedTable,
        payment: totalPayment ? parseFloat(totalPayment) : 0,
        advance: advancePayment ? parseFloat(advancePayment) : 0,
        notes: notes || '',
        restaurantId: RESTAURENT_ID
      }
      
      const response = await fetch(`${baseUrl}/reservations/add/env`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }
      
      const result = await response.json()
      setMessage('Reservation booked successfully!')
      // Reset form
      setName('')
      setContact('')
      setNotes('')
      setTotalPayment('')
      setAdvancePayment('')
      setSelectedTable('')
      // Refresh available tables to show updated availability
      await fetchAvailableTables()
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

  return (
    <div className="section py-12 space-y-10">
      <SectionHeader title="Reserve a table" subtitle="Book your preferred time slot and table. Available slots are shown in real-time."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: form */}
        <div className="card p-6 space-y-6 lg:col-span-2">
          {/* Start DateTime Selection */}
          <div>
            <label className="text-sm text-stone-600 font-medium">Start Date & Time *</label>
            <input 
              type="datetime-local" 
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" 
              value={userStart} 
              onChange={e => setUserStart(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-stone-500 mt-1">Select when your reservation starts</p>
          </div>

          {/* End DateTime Selection */}
          <div>
            <label className="text-sm text-stone-600 font-medium">End Date & Time *</label>
            <input 
              type="datetime-local" 
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" 
              value={userEnd} 
              onChange={e => setUserEnd(e.target.value)}
              min={userStart || new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-stone-500 mt-1">Select when your reservation ends</p>
          </div>

          {/* Available Tables Status */}
          {loadingAvailableTables && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-stone-600">Loading available tables...</p>
            </div>
          )}
          {availableTablesError && (
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-red-600">{availableTablesError}</p>
            </div>
          )}
          {!loadingAvailableTables && !availableTablesError && availableTablesData && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Available Tables</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                  {availableTablesData.availableCount || 0} Available
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {availableTablesData.bookedCount || 0} Booked
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {availableTablesData.totalTables || 0} Total
                </span>
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
          {selectedTable && userStart && userEnd && (
            <div className="bg-brand-50 rounded-xl p-4 animate-slide-up">
              <h4 className="font-medium text-brand-800 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-brand-700">
                <p><span className="font-medium">Start:</span> {new Date(userStart).toLocaleString()}</p>
                <p><span className="font-medium">End:</span> {new Date(userEnd).toLocaleString()}</p>
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
            disabled={saving || !userStart || !userEnd || !selectedTable || !name || !contact}
          >
            {saving ? 'Booking...' : 'Confirm Reservation'}
          </button>
        </div>

        {/* Right: Interactive Table Layout */}
        <div className="card p-6">
          <h3 className="font-medium mb-4">Restaurant Table Layout</h3>
          
          {loadingTables ? (
            <div className="text-center py-8">
              <p className="text-stone-500 text-sm">Loading tables...</p>
            </div>
          ) : !userStart || !userEnd ? (
            <div className="text-center py-8">
              <p className="text-stone-500 text-sm">Please select start and end datetime to see available tables</p>
            </div>
          ) : !availableTablesData ? (
            <div className="text-center py-8">
              <p className="text-stone-500 text-sm">Loading available tables...</p>
            </div>
          ) : tablesByFloor.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-500 text-sm">No tables found. Please add tables in the admin panel.</p>
            </div>
          ) : (
            <>
              {/* Floor Selection */}
              {tablesByFloor.length > 1 && (
                <div className="mb-4">
                  <label className="text-sm text-stone-600 font-medium mb-2 block">Select Floor</label>
                  <select 
                    className="w-full rounded-xl border border-stone-300 px-3 py-2"
                    value={selectedFloor || ''}
                    onChange={e => {
                      setSelectedFloor(e.target.value)
                      setSelectedTable('') // Reset table selection when floor changes
                    }}
                  >
                    {tablesByFloor.map(floor => {
                      const floorId = floor.floorId?.toString() || floor.floorId
                      return (
                        <option key={floorId} value={floorId}>
                          {floor.floorName} ({floor.tables.length} tables)
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div className="mb-4 p-3 bg-brand-50 rounded-lg">
                <p className="text-sm font-medium text-brand-800">
                  Reservation Period
                </p>
                <p className="text-xs text-brand-600 mt-1">
                  From: {new Date(userStart).toLocaleString()} 
                </p>
                <p className="text-xs text-brand-600">
                  To: {new Date(userEnd).toLocaleString()}
                </p>
                {selectedFloor && (
                  <p className="text-xs text-brand-600 mt-1">
                    Floor: {tablesByFloor.find(f => {
                      const floorId = f.floorId?.toString() || f.floorId
                      return floorId === selectedFloor
                    })?.floorName || 'N/A'}
                  </p>
                )}
                <p className="text-xs text-brand-600 mt-1">
                  Available: {availableTablesData?.availableCount || 0} tables | 
                  Booked: {availableTablesData?.bookedCount || 0} tables
                </p>
              </div>
              
              {/* Table Grid Layout - Show available + booked tables from selected floor */}
              {selectedFloor && (() => {
                const currentFloor = tablesByFloor.find(f => {
                  const floorId = f.floorId?.toString() || f.floorId
                  return floorId === selectedFloor
                })
                const floorTables = currentFloor?.tables || []
                const availableTablesList = availableTablesData?.availableTables || []
                const bookedTablesList = availableTablesData?.bookedTables || []
                
                // Normalize table number helper
                const normalizeTableNum = (num) => {
                  if (!num) return '';
                  let normalized = num.toString().trim();
                  if (normalized.toUpperCase().startsWith('T')) {
                    normalized = normalized.substring(1);
                  }
                  return normalized;
                };
                
                if (floorTables.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-stone-500 text-sm">No tables found on this floor.</p>
                    </div>
                  )
                }
                
                return (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {floorTables.map(table => {
                      const tableId = table.tableNumber
                      const normalizedTableId = normalizeTableNum(tableId)
                      
                      const matchesList = (list) => list.some(item => {
                        const normalizedItem = normalizeTableNum(item)
                        return (
                          normalizedTableId === normalizedItem ||
                          tableId === item ||
                          `T${normalizedTableId}` === item ||
                          normalizedTableId === `T${normalizedItem}`
                        )
                      })
                      
                      const isAvailable = matchesList(availableTablesList)
                      const isBooked = !isAvailable && matchesList(bookedTablesList)
                      const isSelected = selectedTable === tableId
                      
                      const buttonClasses = isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-lg transform scale-105 table-selected'
                        : isAvailable
                          ? 'bg-green-50 text-green-700 border-green-300 cursor-pointer hover:bg-green-100 hover:border-green-400 table-available'
                          : isBooked
                            ? 'bg-orange-100 text-orange-700 border-orange-300 cursor-not-allowed table-booked'
                            : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed table-unavailable'
                      
                      return (
                        <button
                          key={table._id}
                          type="button"
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedTable(tableId)
                              setTableWarning('')
                            } else if (isBooked) {
                              setTableWarning(`Table ${tableId} is already booked between ${new Date(userStart).toLocaleString()} and ${new Date(userEnd).toLocaleString()}. Please choose another table.`)
                              setTimeout(() => setTableWarning(''), 3000)
                            } else {
                              setTableWarning(`Table ${tableId} is not available for this time period. Please choose another table.`)
                              setTimeout(() => setTableWarning(''), 3000)
                            }
                          }}
                          className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-medium transition-all ${buttonClasses}`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{tableId}</div>
                            {isBooked && !isSelected && (
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
                )
              })()}
              
              {/* Table Status Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                  <span className="text-stone-600">Available - Click to select</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                  <span className="text-stone-600">Booked - Already reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-brand-600 rounded"></div>
                  <span className="text-stone-600">Selected - Your choice</span>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Available tables are shown in green, booked ones in orange.
                </p>
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
                    Ready for {guests} {guests === 1 ? 'guest' : 'guests'} from {new Date(userStart).toLocaleString()} to {new Date(userEnd).toLocaleString()}
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
