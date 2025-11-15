import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, MapPin, Phone, Check, Loader2, AlertCircle } from 'lucide-react';

function ReservationPage() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    specialRequests: ''
  });
  const [step, setStep] = useState(1); // 1: Package, 2: Details, 3: Confirmation

  const packages = [
    {
      id: 'standard',
      name: 'เซ็ตมาตรฐาน',
      nameEn: 'Standard Set',
      price: 259,
      description: 'เหมาะสำหรับ 2 ท่าน',
      descriptionEn: 'Perfect for 2 persons',
      features: [
        'เนื้อหมู 4 ชนิด',
        'อาหารทะเล 2 ชนิด',
        'ผักสดและเครื่องเคียง',
        'เส้นและน้ำจิ้ม',
        'น้ำเปล่าและข้าวสวย'
      ],
      badge: 'ยอดนิยม',
      badgeEn: 'Popular'
    },
    {
      id: 'premium',
      name: 'เซ็ตพรีเมียม',
      nameEn: 'Premium Set',
      price: 299,
      description: 'เหมาะสำหรับ 2 ท่าน',
      descriptionEn: 'Perfect for 2 persons',
      features: [
        'เนื้อหมู 4 ชนิด',
        'เนื้อวัว 2 ชนิด (พรีเมียม)',
        'อาหารทะเล 2 ชนิด',
        'ผักสดและเครื่องเคียง',
        'เส้นและน้ำจิ้มพิเศษ',
        'น้ำเปล่าและข้าวสวย'
      ],
      badge: 'แนะนำ',
      badgeEn: 'Recommended'
    }
  ];

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00'
  ];

  useEffect(() => {
    // Generate mock available tables
    const tables = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      number: `T${String(i + 1).padStart(2, '0')}`,
      seats: i % 3 === 0 ? 4 : i % 3 === 1 ? 6 : 2,
      available: Math.random() > 0.3,
      tier: i % 2 === 0 ? 'standard' : 'premium'
    }));
    setAvailableTables(tables);
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleConfirmReservation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find available table
      const availableTable = availableTables.find(
        table => table.available && table.seats >= reservationData.guests
      );

      if (availableTable) {
        // Navigate to order page with table ID
        navigate(`/${availableTable.id}`);
      } else {
        alert('ขออภัย ไม่มีโต๊ะว่างสำหรับจำนวนคนนี้');
      }
    } catch (error) {
      console.error('Reservation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPackageSelection = () => (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-serif font-bold text-white text-center mb-16">
        เลือกแพ็คเกจของคุณ
        <span className="block text-red-400 text-lg mt-2">Choose Your Package</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => handlePackageSelect(pkg)}
            className={`bg-black border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
              selectedPackage?.id === pkg.id
                ? 'border-red-600 bg-red-600/10'
                : 'border-red-600/30 hover:border-red-600/60 hover:bg-red-600/5'
            }`}
          >
            <div className="text-center">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-serif font-bold text-white">{pkg.name}</h3>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {pkg.badge}
                </span>
              </div>

              <p className="text-red-400 font-serif mb-4">{pkg.nameEn}</p>
              <p className="text-gray-400 mb-4">{pkg.description}</p>
              <p className="text-gray-500 text-sm mb-6">{pkg.descriptionEn}</p>

              <div className="text-5xl font-bold text-red-600 mb-6">฿{pkg.price}</div>

              <div className="text-left space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                เลือกแพ็คเกจนี้ / Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">รายละเอียดการจอง</h2>
        <p className="text-xl text-red-400 font-serif">Reservation Details</p>
      </div>

      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-8">
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                ชื่อผู้จอง / Name
              </label>
              <input
                type="text"
                required
                value={reservationData.name}
                onChange={(e) => setReservationData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="กรอกชื่อของคุณ"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                เบอร์โทรศัพท์ / Phone
              </label>
              <input
                type="tel"
                required
                value={reservationData.phone}
                onChange={(e) => setReservationData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="012-345-6789"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                วันที่ / Date
              </label>
              <input
                type="date"
                required
                value={reservationData.date}
                onChange={(e) => setReservationData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                เวลา / Time
              </label>
              <select
                required
                value={reservationData.time}
                onChange={(e) => setReservationData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
              >
                <option value="">เลือกเวลา</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              จำนวนคน / Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setReservationData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="text-white text-2xl font-semibold w-16 text-center">{reservationData.guests}</span>
              <button
                type="button"
                onClick={() => setReservationData(prev => ({ ...prev, guests: prev.guests + 1 }))}
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              คำขอพิเศษ / Special Requests
            </label>
            <textarea
              value={reservationData.specialRequests}
              onChange={(e) => setReservationData(prev => ({ ...prev, specialRequests: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none resize-none"
              rows={3}
              placeholder="กรอกคำขอพิเศษ (ถ้ามี)"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ย้อนกลับ / Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              ถัดไป / Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">ยืนยันการจอง</h2>
        <p className="text-xl text-red-400 font-serif">Confirm Reservation</p>
      </div>

      <div className="bg-gray-900/50 border border-red-600/20 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">ข้อมูลการจอง</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-red-500 mr-3" />
                  <span>ชื่อ: {reservationData.name}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 text-red-500 mr-3" />
                  <span>โทร: {reservationData.phone}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-5 h-5 text-red-500 mr-3" />
                  <span>วันที่: {reservationData.date}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 text-red-500 mr-3" />
                  <span>เวลา: {reservationData.time}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-red-500 mr-3" />
                  <span>จำนวนคน: {reservationData.guests} ท่าน</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">แพ็คเกจที่เลือก</h3>
              <div className="bg-black/50 border border-red-600/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-white">{selectedPackage.name}</h4>
                  <span className="text-2xl font-bold text-red-600">฿{selectedPackage.price}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{selectedPackage.nameEn}</p>
                <p className="text-gray-500">{selectedPackage.description}</p>
              </div>

              <div className="mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                <p className="text-white font-semibold">รวมทั้งหมด: ฿{selectedPackage.price}</p>
                <p className="text-gray-400 text-sm mt-1">จ่ายที่ร้านหลังรับประทาน</p>
              </div>
            </div>
          </div>

          {reservationData.specialRequests && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">คำขอพิเศษ</h3>
              <p className="text-gray-300 bg-black/50 border border-red-600/20 rounded-lg p-4">
                {reservationData.specialRequests}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              disabled={loading}
            >
              ย้อนกลับ / Back
            </button>
            <button
              onClick={handleConfirmReservation}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  กำลังดำเนินการ...
                </>
              ) : (
                'ยืนยันการจอง / Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/src/assets/background.png"
            alt="Reservation Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-3 rounded-full">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-serif font-bold text-white mb-4">จองโต๊ะ</h1>
          <p className="text-xl text-red-400 font-serif mb-6">Make a Reservation</p>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            จองโต๊ะล่วงหน้าเพื่อประสบการณ์ที่ดีที่สุด
            Reserve your table in advance for the best dining experience
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 transition-colors ${
                step >= 2 ? 'bg-red-600' : 'bg-gray-700'
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 transition-colors ${
                step >= 3 ? 'bg-red-600' : 'bg-gray-700'
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        {step === 1 && renderPackageSelection()}
        {step === 2 && renderDetailsForm()}
        {step === 3 && renderConfirmation()}
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-serif font-bold text-white mb-8">ข้อมูลการจอง</h3>
          <p className="text-gray-400 mb-4">
            • จองล่วงหน้าอย่างน้อย 1 ชั่วโมง
            <br />
            • สามารถเปลี่ยนแปลงหรือยกเลิกได้ 30 นาทีก่อนเวลาจอง
            <br />
            • โต๊ะจะถูกจองไว้ 15 นาทีหลังเวลาที่จอง
          </p>
          <p className="text-red-400 text-sm">
            • Advance reservation required (at least 1 hour)
            <br />
            • Changes or cancellations allowed up to 30 minutes before reservation time
            <br />
            • Tables will be held for 15 minutes after reservation time
          </p>
        </div>
      </section>
    </div>
  );
}

export default ReservationPage;