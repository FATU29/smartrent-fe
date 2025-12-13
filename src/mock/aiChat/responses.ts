export const AI_CHAT_RESPONSES = {
  pricing: {
    vi: 'Giá thuê phụ thuộc vào loại hình bất động sản, vị trí và diện tích. Bạn có thể xem chi tiết giá trên từng tin đăng hoặc liên hệ chủ nhà để biết thêm thông tin.',
    en: 'Rental prices depend on property type, location, and area. You can view detailed prices on each listing or contact the landlord for more information.',
  },
  search: {
    vi: 'Bạn có thể tìm kiếm phòng trọ bằng cách sử dụng bộ lọc theo khu vực, giá cả, diện tích trên trang chủ. Hoặc cho tôi biết bạn muốn tìm phòng ở khu vực nào?',
    en: 'You can search for rooms using filters by area, price, and size on the homepage. Or let me know which area you want to find a room in?',
  },
  posting: {
    vi: 'Để đăng tin cho thuê, bạn cần đăng nhập và chọn "Đăng tin" trên menu. Sau đó điền đầy đủ thông tin về bất động sản của bạn. Bạn có cần hướng dẫn chi tiết không?',
    en: 'To post a listing, you need to log in and select "Post Property" from the menu. Then fill in complete information about your property. Do you need detailed instructions?',
  },
  contact: {
    vi: 'Bạn có thể liên hệ chủ nhà thông qua số điện thoại hoặc nút "Nhắn tin" trên từng tin đăng. Nếu cần hỗ trợ, vui lòng liên hệ hotline của chúng tôi.',
    en: 'You can contact landlords via phone number or the "Message" button on each listing. If you need support, please contact our hotline.',
  },
  thanks: {
    vi: 'Rất vui được giúp đỡ bạn! Nếu có thêm câu hỏi nào, đừng ngại hỏi nhé! 😊',
    en: "Happy to help! If you have any more questions, don't hesitate to ask! 😊",
  },
  default: {
    vi: 'Cảm ơn câu hỏi của bạn! Hiện tại tôi đang học cách trả lời tốt hơn. Bạn có thể thử hỏi về: tìm phòng, giá thuê, đăng tin, hoặc liên hệ chủ nhà.',
    en: "Thank you for your question! I'm currently learning to answer better. You can try asking about: finding rooms, rental prices, posting listings, or contacting landlords.",
  },
  welcome: {
    vi: 'Xin chào! Tôi là trợ lý AI của Smart Rent. Tôi có thể giúp gì cho bạn?',
    en: 'Hello! I am Smart Rent AI assistant. How can I help you?',
  },
}

export type TAiChatResponseKey = keyof typeof AI_CHAT_RESPONSES
