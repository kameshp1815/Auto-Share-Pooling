// Debug script to test ride acceptance and driver details
const testRideAcceptance = async () => {
  console.log('🔍 Testing Ride Acceptance and Driver Details...\n');

  try {
    // 1. First, let's check if there are any available rides
    console.log('1. 📋 Checking available rides...');
    const availableRes = await fetch('http://localhost:5000/api/rides/available');
    const availableRides = await availableRes.json();
    console.log('Available rides:', availableRides);

    if (availableRides.length === 0) {
      console.log('❌ No available rides found. Please book a ride first.');
      return;
    }

    // 2. Get the first available ride
    const ride = availableRides[0];
    console.log('\n2. 🚗 Testing acceptance of ride:', ride._id);

    // 3. Test driver details (you'll need to replace with actual driver email)
    const testDriverEmail = 'driver@example.com'; // Replace with actual driver email
    
    console.log('3. 👤 Testing with driver email:', testDriverEmail);

    // 4. Accept the ride
    const acceptRes = await fetch(`http://localhost:5000/api/rides/accept/${ride._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver: testDriverEmail })
    });

    if (acceptRes.ok) {
      const acceptData = await acceptRes.json();
      console.log('✅ Ride accepted successfully!');
      console.log('📋 Ride details:', acceptData.ride);
      console.log('👤 Driver details:', acceptData.ride.driverDetails);
      
      // 5. Check if driver details are properly stored
      if (acceptData.ride.driverDetails && acceptData.ride.driverDetails.name) {
        console.log('✅ Driver details are properly stored!');
        console.log('   Driver Name:', acceptData.ride.driverDetails.name);
        console.log('   Phone:', acceptData.ride.driverDetails.phone);
        console.log('   Vehicle Number:', acceptData.ride.driverDetails.vehicleNumber);
        console.log('   Vehicle Type:', acceptData.ride.driverDetails.vehicleType);
      } else {
        console.log('❌ Driver details are missing or incomplete');
      }
      
      // 6. Test ongoing ride retrieval
      console.log('\n4. 🔄 Testing ongoing ride retrieval...');
      const ongoingRes = await fetch(`http://localhost:5000/api/rides/ongoing/${ride.email}`);
      if (ongoingRes.ok) {
        const ongoingData = await ongoingRes.json();
        console.log('📊 Ongoing ride data:', ongoingData);
        if (ongoingData && ongoingData.driverDetails) {
          console.log('✅ Ongoing ride contains driver details!');
        } else {
          console.log('❌ Ongoing ride missing driver details');
        }
      }
      
    } else {
      const errorData = await acceptRes.json();
      console.log('❌ Failed to accept ride:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('\n🏁 Debug test completed!');
};

// Run the test
testRideAcceptance();
