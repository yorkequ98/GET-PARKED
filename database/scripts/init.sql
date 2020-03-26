CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `hash` varchar(512) NOT NULL,
  `businessName` varchar(100),
  `mobile` varchar(100) NOT NULL, 
  `email` varchar(100) NOT NULL,
  `address` varchar(100),
  `license` varchar(500),
  `created` datetime,
  `paymentId` varchar(100) /* Paydock customer id */
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

ALTER TABLE `accounts`
MODIFY `created` DATETIME DEFAULT CURRENT_TIMESTAMP;

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `mobile`, `email`, `license`) VALUES (
  1,
  'Test Smith', 
  '$2b$10$3IFE78B//XzXTbbCUEFmJuYqdvp9HPp875DFqUU0.WlwYKrXkbWKW', /* password was test */
  '0400123456',
  'test@test.com',
  'uploads/template.png'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`) VALUES (
  2,
  'Yunke Qu', 
  '$2b$10$DRgproxC/.P9Md8p/wqQIeCAQl5vTzg3UOwY8irWsUkQQQhUAWt1.', /* password was test */
  'UQ',
  '0400123456',
  '2 Hollywood Street',
  'yunke@test.com',
  'uploads/template.png'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`) VALUES (
  3,
  'Matthew Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV6', /* password was test */
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test.com',
  'uploads/template.png'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`, `created`) VALUES (
  4,
  'Test Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV1', 
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test1.com',
  'uploads/template.png',
  '2019-08-02 01:00:00'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`, `created`) VALUES (
  5,
  'Test Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV0',
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test2.com',
  'uploads/template.png',
  '2019-09-03 01:00:00'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`, `created`) VALUES (
  6,
  'Test Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV9', 
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test3.com',
  'uploads/template.png',
  '2019-09-03 01:00:00'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`, `created`) VALUES (
  7,
  'Test Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV8',
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test4.com',
  'uploads/template.png',
  '2019-10-08 01:00:00'
);

INSERT INTO `accounts` (`id`, `fullName`, `hash`, `businessName`, `mobile`, `address`, `email`, `license`, `created`) VALUES (
  8,
  'Test Jones', 
  '$2b$10$syiSRSEGrFoYAWPse0N81.XNGsGhtA5/Ge8LwDPGOY/2rOHA6ScV7', 
  'UQ',
  '093084092',
  '2 Hollywood Street',
  'matt@test5.com',
  'uploads/template.png',
  '2019-10-09 01:00:00'
);
ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;


CREATE TABLE IF NOT EXISTS `park` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `street` varchar(100) NOT NULL,
  `suburb` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postcode` int(11) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `bayNumber` int(11) NOT NULL,
  `price` float NOT NULL,
  `type` varchar(100) NOT NULL,
  `suitableFor` varchar(100) NOT NULL,
  `accessHours` varchar(100) NOT NULL,
  `carparkType` varchar(100) NOT NULL,
  `wheelchairAccess` int(11) NOT NULL,
  `additionalComments` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `parks_in` (
  `userId` int(11) NOT NULL,
  `parkId` int(11) NOT NULL,
  PRIMARY KEY (`userId`, `parkId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `parks_in` 
ADD FOREIGN KEY (`userId`) REFERENCES `accounts` (`id`)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE `parks_in` 
ADD FOREIGN KEY (`parkId`) REFERENCES `park` (`id`)
ON DELETE RESTRICT
ON UPDATE CASCADE;


INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '25 Morgan St',
    'Fortitude Valley',
    'Brisbane',
    'QLD',
    '4000',
    -27.457285,
    153.037278,
    1,
    450.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

INSERT INTO `park` (
  `street`, `suburb`, `region`,  `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '25 Morgan St',
    'Fortitude Valley',
    'Brisbane',
    'QLD',
    '4000',
    -27.457285,
    153.037278,
    2,
    450.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`,  `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '25 Morgan St',
    'Fortitude Valley',
    'Brisbane', 
    'QLD',
    '4000',
    -27.457285,
    153.037278,
    3,
    450.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '45 Eagle St',
    'Brisbane City',
    'Brisbane',
    'QLD',
    '4000',
    -27.468989,
    153.030430,
    1,
    600.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '153 Stanley St',
    'South Brisbane',
    'Brisbane',
    'QLD',
    '4101',
    -27.478862,
    153.022789,
    1,
    600.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '5/11 Chasely St',
    'Auchenflower',
    'Brisbane',
    'QLD',
    '4066',
    -27.477879,
    152.999116,
    1,
    600.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '250 Ipswich Rd',
    'Woolloongabba',
    'Brisbane',
    'QLD',
    '4102',
    -27.499835,
    153.035931,
    1,
    600.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );

  INSERT INTO `park` (
  `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, 
  `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, 
  `wheelchairAccess`, `additionalComments`
  ) VALUES (
    '813 Gympie Rd',
    'Chermside',
    'Brisbane',
    'QLD',
    '4032',
    -27.387399,
    153.031430,
    1,
    600.00,
    'carpark',
    'All Vehicles',
    '6am - 7pm Weekdays',
    'Long-term',
    1,
    ""
  );
  
INSERT INTO `parks_in` (`userId`, `parkId`)
  VALUES (1, 1);

create table vehicles (
  plate varchar(10) primary key,
  model varchar(50) not null,  
  owner int(11) not null, 
  brand varchar(50) not null, 
  foreign key (owner) references accounts (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  