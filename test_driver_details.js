// Test script to verify driver details feature
// This script tests the API endpoints to ensure driver details are properly stored and retrieved

const testDriverDetails = async () => {
  console.log('🧪 Testing Driver Details Feature...\n');

  // Test data
  const testRide = {
    email: 'test@example.com',
    from: 'Test Location 1',
    to: 'Test Location 2',
    vehicle: 'auto',
    fare: '150',
    distance: '5.2'
  };

  const testDriver = {
    email: 'driver@example.com',
    name: 'John Driver',
    phone: '9876543210',
    vehicleRegNumber: 'TN01AB1234',
    vehicleType: 'auto',
    vehicleMakeModel: 'Bajaj RE'
  };

  try {
    // 1. Test booking a ride
    console.log('1. 📝 Testing ride booking...');
    const bookResponse = await fetch('http://localhost:5000/api/rides/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRide)
    });
    
    if (bookResponse.ok) {
      const bookData = await bookResponse.json();
      console.log('✅ Ride booked successfully:', bookData.rideId);
      
      // 2. Test accepting ride with driver details
      console.log('\n2. 🚗 Testing ride acceptance with driver details...');
      const acceptResponse = await fetch(`http://localhost:5000/api/rides/accept/${bookData.rideId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver: testDriver.email })
      });
      
      if (acceptResponse.ok) {
        const acceptData = await acceptResponse.json();
        console.log('✅ Ride accepted successfully');
        console.log('📋 Driver details stored:', acceptData.ride.driverDetails);
        
        // 3. Test retrieving ride history with driver details
        console.log('\n3. 📊 Testing ride history retrieval...');
        const historyResponse = await fetch(`http://localhost:5000/api/rides/history/${testRide.email}`);
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const acceptedRide = historyData.find(ride => ride._id === bookData.rideId);
          
          if (acceptedRide && acceptedRide.driverDetails) {
            console.log('✅ Driver details retrieved successfully:');
            console.log('   Driver Name:', acceptedRide.driverDetails.name);
            console.log('   Phone:', acceptedRide.driverDetails.phone);
            console.log('   Vehicle Number:', acceptedRide.driverDetails.vehicleNumber);
            console.log('   Vehicle Type:', acceptedRide.driverDetails.vehicleType);
            console.log('   Vehicle Model:', acceptedRide.driverDetails.vehicleModel);
          } else {
            console.log('❌ Driver details not found in ride history');
          }
        } else {
          console.log('❌ Failed to retrieve ride history');
        }
        
        // 4. Test ongoing ride retrieval
        console.log('\n4. 🔄 Testing ongoing ride retrieval...');
        const ongoingResponse = await fetch(`http://localhost:5000/api/rides/ongoing/${testRide.email}`);
        
        if (ongoingResponse.ok) {
          const ongoingData = await ongoingResponse.json();
          if (ongoingData && ongoingData.driverDetails) {
            console.log('✅ Ongoing ride with driver details retrieved successfully');
            console.log('   Status:', ongoingData.status);
            console.log('   Driver:', ongoingData.driverDetails.name);
          } else {
            console.log('❌ Ongoing ride or driver details not found');
          }
        } else {
          console.log('❌ Failed to retrieve ongoing ride');
        }
        
      } else {
        console.log('❌ Failed to accept ride:', await acceptResponse.text());
      }
    } else {
      console.log('❌ Failed to book ride:', await bookResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('\n🏁 Test completed!');
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testDriverDetails();
}

module.exports = testDriverDetails;
