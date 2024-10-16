**IoT-Based Smart Parking System with Real-Time Monitoring and Booking**

# Introduction

The Internet of Things (IoT) has revolutionized the way various sectors approach automation, particularly in smart city initiatives. One major area of improvement is the management of parking spaces in urban areas. In this project, we developed a scalable IoT-based parking system that integrates both sensor data for monitoring parking space availability and a webbased platform for real-time booking.

The system comprises two main parts:

- **A back-end server hosted on an Amazon EC2 instance**, responsible for handling parking space bookings, managing user details, and storing parking space statuses.
- **A local machine** running **simulated parking sensors and Node-RED flow** that publishes sensor data to an MQTT broker, which interacts with the server to update parking statuses.

To enhance scalability, an **Amazon Machine Image (AMI)** of the EC2 instance was created, and a **load balancer** was implemented across three instances, ensuring the system can handle increased demand and provide reliable service.

This report provides an overview of the components involved in the development of the system, its architecture, and the technologies employed in creating an efficient, real-time parking management solution.

# System Architecture and Components

The architecture of the parking management system is based on a distributed environment, with multiple components working together to achieve real-time monitoring and booking. The key components include:

## Back-End on EC2 Instance

The core of the system is hosted on an **Amazon EC2 instance**, which runs the server and handles all booking-related functionality. To improve scalability, an **AMI** of the instance was created, and the load was distributed across three instances using an **Elastic Load Balancer**. This setup ensures high availability and improved fault tolerance.

The key back-end scripts deployed on the instance are:

- **paygate.js**: This is the primary booking service that handles parking space reservations. It connects to MongoDB and processes booking requests sent from the front-end.
- **server.js**: This file handles the general parking management logic, including fetching parking space details, storing booking statuses in the database, and serving detailed history of parking space usage.
- **MongoDB Database**: The system stores all parking space statuses in a MongoDB database hosted on the cloud. The database is used to maintain up-to-date information about the availability of parking spaces, along with user details (name and car number) for each reservation.

## Front-End

The front-end is implemented via an HTML-based web form (payment.html) that allows users to interact with the system by reserving parking spaces. The front-end form includes fields for the user's name, car number, parking space selection, and duration of booking.

- **Dynamic Form Elements**: The form dynamically fetches the current list of available parking spaces and their statuses from the server. This ensures that users always have access to real-time data when making a reservation.
- **User Interaction**: Once the form is filled out and submitted, the back-end API processes the booking request, updates the parking space status in the database, and displays a confirmation message to the user.

## Local Sensor Simulation

On the local machine, a sensor simulation script (parking_sensor.js) is used to mimic the presence of real parking sensors in the field. The script simulates random occupancy for parking spots and publishes the data to an MQTT broker.

- **MQTT Broker**: The MQTT broker is used to relay messages from the simulated sensors to the back-end server. Each message contains the parking ID, the occupancy status (Occupied or Free), and mock user data (if applicable).
- **Node-RED Flow**: The system also integrates **Node-RED** for data flow management, which helps in processing and filtering the sensor data before sending it to the backend.

## Real-Time Integration

The system is designed for real-time data flow between sensors and the server. The MQTT broker serves as a central communication hub for sensor data, which is processed by the back-end to reflect real-time parking statuses on the front-end.

# System Functionality

The project is designed to manage the lifecycle of a parking space from booking to vacancy, with real-time updates based on sensor data. Here’s an overview of the core functionalities:

## Booking a Parking Space

- Users can access the web-based form to reserve a parking space for a specific duration. The form fetches available parking spaces from the server.
- The paygate.js script processes the booking request by checking the parking space's current status from the MongoDB database. If the parking space is free, the system updates its status to "Occupied" and records the user's name, car number, and booking duration.
- The parking space will be automatically freed after the allotted booking time has expired, ensuring it becomes available for other users.

## Real-Time Parking Space Monitoring

- The parking sensor simulation (parking_sensor.js) continuously generates random occupancy data for parking spaces and publishes it to the MQTT broker every five seconds.
- However, if a parking space has already been booked by a user (via paygate.js), the simulation skips generating mock data for that parking spot, ensuring accurate occupancy information.

## Handling Parking Spot Status

- The **server.js** script is responsible for fetching and displaying parking space statuses. It includes functionality to retrieve the full history of a parking space, displaying past bookings along with the user’s details (name and car number).
- The front-end also displays the real-time status of parking spaces, providing transparency to users.

# Technologies and Tools Used

This section provides an overview of the technologies employed in building the system, and their respective roles:

## Amazon EC2 Instance

The server-side components (paygate.js, server.js, and payment.html) are deployed on an **EC2 instance**, providing scalability and flexibility. The EC2 environment allows the system to handle multiple users and scale based on demand. To further enhance scalability, an **AMI** of the EC2 instance was created, and a **load balancer** was deployed across three instances. This setup ensures that the system can manage increased demand and provides high availability.

## MongoDB Atlas

MongoDB is used as the database layer for storing all parking space statuses and booking information. **MongoDB Atlas** is a fully managed cloud service, which ensures the reliability and availability of the data. The system uses MongoDB’s aggregation framework to efficiently query the latest status and history of parking spaces.

## MQTT (Message Queuing Telemetry Transport)

The **MQTT broker** plays a critical role in relaying messages between the simulated sensors and the back-end server. The lightweight nature of MQTT makes it suitable for IoT use cases where frequent data updates (such as parking occupancy) are required.

## Node-RED

**Node-RED** is utilized for orchestrating sensor data flow and performing basic filtering before data is sent to the back-end. It enables easy configuration of data pipelines and processing logic without the need for extensive coding.

## JavaScript and Node.js

Both the back-end and sensor scripts are written in **Node.js**, leveraging JavaScript’s asynchronous nature to handle multiple I/O operations efficiently. This is particularly important when dealing with real-time sensor data and multiple API requests.

## Front-End Technologies

The front-end web form uses HTML, CSS, and JavaScript to interact with the back-end via AJAX calls. The dynamic nature of the form ensures that users always receive the most upto-date information when making a booking.

# Challenges and Future Improvements

During the development of the project, a few challenges were encountered, which also present opportunities for future improvement:

## Synchronization Between Components

One challenge involved ensuring proper synchronization between the sensor simulation running locally and the MongoDB database hosted in the cloud. This was addressed by periodically fetching the latest booked parking spaces to ensure the sensor simulation does not mock those spots.

## Scalability Considerations

While the system works well for the current setup, further scaling would require optimizing the message flow between the sensors and the back-end. This could be achieved by distributing the workload across multiple instances of the sensor simulation, or by employing more advanced MQTT broker configurations. The use of an **AMI** and **load balancer** across three EC2 instances has improved the scalability of the current system, allowing it to handle more users and ensuring high availability.

## Enhancing Security

Currently, the project does not include payment processing, as it is in the beta phase. In the future, secure payment gateways (e.g., Stripe) could be integrated to allow users to complete real-time payments. Additionally, more robust authentication mechanisms could be implemented to protect user data.

# Conclusion

This project successfully demonstrates the power of IoT technology in enhancing parking management systems by providing real-time monitoring and automated booking services. The integration of sensor simulations, MQTT communication, and a robust back-end hosted on the cloud ensures that users can reserve parking spaces efficiently while administrators can monitor the system’s status seamlessly. The addition of an **AMI** and **load balancer** to distribute the load across three EC2 instances ensures that the system is highly scalable and can handle increased demand effectively. Future enhancements could include the addition of real sensors, better scalability, and secure payment processing for a fully functional smart parking solution.
