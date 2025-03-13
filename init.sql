CREATE DATABASE IF NOT EXISTS mriso_viajes;
USE mriso_viajes;

CREATE TABLE `passengers` (
  `PassengerID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `DNI` varchar(20) NOT NULL,
  `Birthdate` date NOT NULL,
  `Phone` varchar(20) NOT NULL,
  PRIMARY KEY (`PassengerID`),
  UNIQUE KEY `DNI` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `trips` (
  `TripID` int(11) NOT NULL AUTO_INCREMENT,
  `Destination` varchar(100) NOT NULL,
  `Date` date NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `MaxPassengers` int(11) NOT NULL DEFAULT 30,
  PRIMARY KEY (`TripID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `trippassengers` (
  `TripID` int(11) NOT NULL,
  `PassengerID` int(11) NOT NULL,
  `Paid` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`TripID`,`PassengerID`),
  KEY `PassengerID` (`PassengerID`),
  CONSTRAINT `TripPassengers_ibfk_1` FOREIGN KEY (`TripID`) REFERENCES `trips` (`TripID`),
  CONSTRAINT `TripPassengers_ibfk_2` FOREIGN KEY (`PassengerID`) REFERENCES `passengers` (`PassengerID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1; 