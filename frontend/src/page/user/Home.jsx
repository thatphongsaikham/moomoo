import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Phone, Star, ChefHat, Flame } from "lucide-react";
import { useBilingual } from '@/hook/useBilingual';

function Home() {
  const navigate = useNavigate();
  const { isThai } = useBilingual();
  const [tableNumber, setTableNumber] = useState('');

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 z-10"></div>
        <div className="absolute inset-0">
          <img
            src="/src/assets/background.png"
            alt="BBQ Restaurant Background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600 p-4 rounded-full animate-pulse">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight">
            moomoo
          </h1>
          <p className="text-xl md:text-2xl text-red-400 font-serif mb-2">
            บุฟเฟ่ต์หมูกระทะ
          </p>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            ทานไม่อั้น! เนื้อสด ผักสด วัตถุดิบคุณภาพ ในราคาคุ้มค่า
            All You Can Eat Thai BBQ & Hotpot Buffet
          </p>
          
          {/* Table Number Entry */}
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-red-600/30">
              <label className="block text-white text-lg font-semibold mb-3 text-center">
                {isThai ? 'กรุณาระบุหมายเลขโต๊ะของคุณ' : 'Enter Your Table Number'}
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder={isThai ? 'โต๊ะที่ 1-10' : 'Table 1-10'}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 text-center text-xl font-bold"
                />
                <button
                  onClick={() => {
                    const num = parseInt(tableNumber);
                    if (num >= 1 && num <= 10) {
                      localStorage.setItem('tableNumber', tableNumber);
                      navigate('/menu');
                    } else {
                      alert(isThai ? 'กรุณาระบุโต๊ะที่ 1-10' : 'Please enter table 1-10');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  {isThai ? 'เริ่มสั่ง' : 'Start'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-3 text-center">
                {isThai ? 'หมายเลขโต๊ะอยู่บนแผ่นป้ายที่โต๊ะของคุณ' : 'Table number is on the sign at your table'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/menu')}
              className="border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              ดูเมนู / View Menu
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-white text-center mb-16">
            ทำไมต้องเรา
            <span className="block text-red-500 text-2xl mt-2">Why Choose Us</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4 group-hover:bg-red-600/30 transition-all duration-300 group-hover:scale-105">
                <ChefHat className="w-16 h-16 text-red-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-3">สูตรต้นตำรับ</h3>
              <p className="text-gray-400 leading-relaxed">เครื่องเทศและวัตถุดิบคุณภาพดีที่ส่งมอบรสชาติดั้งเดิมที่ลงตัว</p>
              <p className="text-red-400 mt-2 text-sm">Authentic recipe with premium ingredients</p>
            </div>

            <div className="text-center group">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4 group-hover:bg-red-600/30 transition-all duration-300 group-hover:scale-105">
                <Flame className="w-16 h-16 text-red-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-3">ประสบการณ์มัดหมี่</h3>
              <p className="text-gray-400 leading-relaxed">บรรยากาศอบอุ่นที่เหมาะสำหรับทุกการพบปะสังสรรค์</p>
              <p className="text-red-400 mt-2 text-sm">Perfect dining atmosphere for every occasion</p>
            </div>

            <div className="text-center group">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4 group-hover:bg-red-600/30 transition-all duration-300 group-hover:scale-105">
                <Star className="w-16 h-16 text-red-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-3">บริการระดับพรีเมียม</h3>
              <p className="text-gray-400 leading-relaxed">ทีมงานมืออาชีพพร้อมดูแลให้คุณได้รับประสบการณ์ที่ดีที่สุด</p>
              <p className="text-red-400 mt-2 text-sm">Professional service for the best experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">เมนูแนะนำ</h2>
            <p className="text-xl text-red-400 font-serif">Featured Menu</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gray-900/50 border border-red-600/20 rounded-xl overflow-hidden group hover:border-red-600/50 transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif font-bold text-white">เซ็ตมาตรฐาน</h3>
                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">฿259</span>
                </div>
                <p className="text-gray-400 mb-6">Standard Set</p>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> เนื้อวัวออสเตรเลีย</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> หมูสามชั้น</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ไก่</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> อาหารทะเล</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ผักสด</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-red-600/20 rounded-xl overflow-hidden group hover:border-red-600/50 transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif font-bold text-white">เซ็ตพรีเมียม</h3>
                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">฿299</span>
                </div>
                <p className="text-gray-400 mb-6">Premium Set</p>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> เนื้อวัวพรีเมียม</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> หมูวากิว</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ไก่อบ</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> กุ้งหอยเป๋าฮื้อ</li>
                  <li className="flex items-center"><span className="text-red-500 mr-2">•</span> ผักนานาชนิด</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/menu')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              ดูเมนูทั้งหมด / Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-8">เกี่ยวกับเรา</h2>
          <p className="text-xl text-red-400 font-serif mb-8">About บุฟเฟ่ต์หมูกระทะ</p>
          <p className="text-gray-300 leading-relaxed text-lg mb-8">
            บุฟเฟ่ต์หมูกระทะคือประสบการณ์การทานอาหารแบบดั้งเดิมของไทยที่ผสมผสานกับสไตล์การนำเสนอที่ทันสมัย
            เราให้ความสำคัญกับการเลือกวัตถุดิบคุณภาพดีและการรักษารสชาติดั้งเดิมไว้ให้ครบถ้วน
            เพื่อมอบประสบการณ์ที่ดีที่สุดให้กับลูกค้าทุกท่าน
          </p>
          <p className="text-red-400 text-base">
            บุฟเฟ่ต์หมูกระทะ brings you the authentic Thai BBQ experience with a modern presentation.
            We prioritize quality ingredients and traditional flavors to deliver the best dining experience.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">ติดต่อเรา</h2>
            <p className="text-xl text-red-400 font-serif">Contact & Location</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <MapPin className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">ที่อยู่</h3>
              <p className="text-gray-400">123 ถนนสุขุมวิท<br/>กรุงเทพมหานคร 10110</p>
              <p className="text-red-400 text-sm mt-2">123 Sukhumvit Road<br/>Bangkok 10110</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <Clock className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">เวลาเปิด-ปิด</h3>
              <p className="text-gray-400">จันทร์ - ศุกร์: 11:00 - 22:00<br/>เสาร์ - อาทิตย์: 10:00 - 23:00</p>
              <p className="text-red-400 text-sm mt-2">Mon-Fri: 11:00-22:00<br/>Sat-Sun: 10:00-23:00</p>
            </div>

            <div className="text-center">
              <div className="bg-red-600/20 border border-red-600/30 p-6 rounded-xl mb-4">
                <Phone className="w-12 h-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">โทรศัพท์</h3>
              <p className="text-gray-400">02-123-4567</p>
              <p className="text-red-400 text-sm mt-2">Reservation recommended</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-600/20 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">moomoo</h3>
            <p className="text-red-400 font-serif">บุฟเฟ่ต์หมูกระทะ</p>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 บุฟเฟ่ต์หมูกระทะ. All rights reserved. | สงวนลิขสิทธิ์ พ.ศ. 2567
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
