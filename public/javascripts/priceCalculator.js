function calculateTotalPrice(cartItems, usersWithSameEmail) {
    let totalPrice = 0;
    for (const cartItem of cartItems) {
      totalPrice += cartItem.PurchasePrice * cartItem.Quantity;
    }
  
    let discount = 0;
    if (usersWithSameEmail === 2) {
      discount = 0.1;
    } else if (usersWithSameEmail === 3) {
      discount = 0.3;
    } else if (usersWithSameEmail === 4) {
      discount = 0.4;
    }
  
    const discountedPrice = totalPrice * (1 - discount);
    return discountedPrice;
  }
  
  module.exports = { calculateTotalPrice };