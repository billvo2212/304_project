CREATE DATABASE orders;
go

USE orders;
go

-- CREATE DATABASE orders;

DROP TABLE review;
DROP TABLE shipment;
DROP TABLE productinventory;
DROP TABLE warehouse;
DROP TABLE orderproduct;
DROP TABLE incart;
DROP TABLE product;
DROP TABLE category;
DROP TABLE ordersummary;
DROP TABLE paymentmethod;
DROP TABLE customer;


CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),    
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productImageURL     VARCHAR(100),
    productImage        VARBINARY(MAX),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),    
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
    shipmentDate        DATETIME,   
    shipmentDesc        VARCHAR(100),   
    warehouseId         INT, 
    PRIMARY KEY (shipmentId),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory ( 
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (productId, warehouseId),   
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO category(categoryName) VALUES ('Running Shoes');
INSERT INTO category(categoryName) VALUES ('Training Shoes');
INSERT INTO category(categoryName) VALUES ('Basketball Shoes');
INSERT INTO category(categoryName) VALUES ('Tennis Shoes');
INSERT INTO category(categoryName) VALUES ('Skateboarding Shoes');
INSERT INTO category(categoryName) VALUES ('Casual Sneakers');
INSERT INTO category(categoryName) VALUES ('High-Tops');
INSERT INTO category(categoryName) VALUES ('Low-Tops');
INSERT INTO category(categoryName) VALUES ('Lifestyle Sneakers');
INSERT INTO category(categoryName) VALUES ('Hking Shoes');



INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Air Zoom Pegasus 40', 1, 'Lightweight with Zoom Air units for responsiveness. Versatile for daily runs.',130.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Adidas Ultraboost 22',1,'Plush cushioning with Boost technology, providing energy return for long-distance runs.',180.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Reebok Nano X3',2,'All-purpose training shoe with Flexweave for durability and flexibility.',140.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Metcon 8',2,'Flat, stable sole for weightlifting and high-impact movements during workouts',130.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Under Armour Project Rock 5',2,' Sturdy and supportive shoe with a focus on gym performance and training versatility.',150.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Air Jordan 1',3,'Iconic high-top design with excellent ankle support and a leather upper for durability.',170.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Adidas Barricade',4,'Durable, abrasion-resistant shoe with lateral support for aggressive movements..',140.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike LeBron 20',3,'Designed for powerful players with advanced cushioning for impact protection.',200.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Vans Old Skool',5,'Durable and stylish with padded collars for comfort and flat soles for grip.',70.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Court Air Zoom Vapor Pro',4,'Lightweight with a snug fit, designed for speed on the court.',120.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Under Armour Curry Flow 10',3,'Lightweight with responsive cushioning, tailored for quick cuts and agility.',160.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Brooks Ghost 15',1,'Smooth transitions with DNA LOFT cushioning, ideal for road and treadmill running.',140.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Asics Gel-Resolution 9',4,'Gel cushioning for comfort and durable outsole for hard court surfaces.',150.25);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike SB Dunk Low',5,' Skate-focused design with cushioning and extra grip on the sole.',100.50);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('DC Lynx Zero',5,'Heavy-duty skate shoe with excellent board feel and a classic design.',75.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Converse Chuck Taylor All Star',6,'Timeless canvas design with a rubber sole, perfect for daily wear',60.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Adidas Superstar',6,'Classic leather sneaker with shell-toe design, ideal for casual outfits.',85.50);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Reebok Freestyle Hi',7,'A vintage high-top design originally created for aerobics, now a fashion staple.',75.20);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Dunk High',7,'High-top sneaker offering ankle support with bold, retro-inspired designs.',110.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Converse Chuck 70 High',7,'Enhanced version of the classic Chuck Taylor with better materials and cushioning.',85.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Adidas Stan Smith',8,'Sleek, minimalist design with a leather upper and versatile style.', 85.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Air Force 1 Low',8,'Legendary low-top with cushioning and durable materials for casual use.',90.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Common Projects Achilles Low',8,'Premium leather sneaker with understated elegance, ideal for smart-casual wear.',400.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Puma Suede Classic',6,'Soft suede upper with a clean silhouette, versatile for everyday fashion',70.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Yeezy Boost 350 V2',9,'Fashion-forward design with Boost cushioning, a favorite in streetwear.',220.40);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Nike Air Max 90',9,'Timeless design with visible Air cushioning, merging comfort and style',120.65);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Puma RS-X',9,'Bold and futuristic design, great for statement-making street fashion.',110.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Salomon X Ultra Pioneer',10,'Lightweight and rugged, perfect for trails and light hiking.',121.00);
INSERT product(productName, categoryId, productDesc, productPrice) VALUES ('Columbia Peakfreak X2',10,'Waterproof with grippy soles for varied terrains.',100.00);

INSERT INTO warehouse(warehouseName) VALUES ('Main warehouse');
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (1, 1, 5, 18);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (2, 1, 10, 19);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (3, 1, 3, 10);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (4, 1, 2, 22);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (5, 1, 6, 21.35);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (6, 1, 3, 25);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (7, 1, 1, 30);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (8, 1, 0, 40);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (9, 1, 2, 97);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (10, 1, 3, 31);

INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'arnold' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'bobby' , 'bobby');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');

-- Order 1 can be shipped as have enough inventory
DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (1, '2019-10-15 10:25:55', 550.00)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 1, 1, 130.00)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 2, 150.00)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 10, 1, 120.00);
 

-- DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-16 18:00:00', 750.00)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 5, 150.00);


-- Order 3 cannot be shipped as do not have enough inventory for item 7
-- DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (3, '2019-10-15 3:30:22', 760.00)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 6, 2, 170.00)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 7, 3, 140.00);


-- DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-17 05:45:11', 2252.75)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 3, 4, 140)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 8, 3, 200)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 13, 3, 150.25)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 28, 2, 221)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 29, 4, 100);


-- DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (5, '2019-10-15 10:25:55', 1075)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 4, 150)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 19, 2, 110)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 20, 3, 85);

-- New SQL DDL for lab 8
UPDATE Product SET productImageURL = 'img/1.jpg' WHERE ProductId = 1;
UPDATE Product SET productImageURL = 'img/2.jpg' WHERE ProductId = 2;
UPDATE Product SET productImageURL = 'img/3.jpg' WHERE ProductId = 3;
UPDATE Product SET productImageURL = 'img/4.jpg' WHERE ProductId = 4;
UPDATE Product SET productImageURL = 'img/5.jpg' WHERE ProductId = 5;
UPDATE Product SET productImageURL = 'img/6.jpg' WHERE ProductId = 6;
UPDATE Product SET productImageURL = 'img/7.jpg' WHERE ProductId = 7;
UPDATE Product SET productImageURL = 'img/8.jpg' WHERE ProductId = 8;
UPDATE Product SET productImageURL = 'img/9.jpg' WHERE ProductId = 9;
UPDATE Product SET productImageURL = 'img/10.jpg' WHERE ProductId = 10;
UPDATE Product SET productImageURL = 'img/11.jpg' WHERE ProductId = 11;
UPDATE Product SET productImageURL = 'img/12.jpg' WHERE ProductId = 12;
UPDATE Product SET productImageURL = 'img/13.jpg' WHERE ProductId = 13;
UPDATE Product SET productImageURL = 'img/14.jpg' WHERE ProductId = 14;
UPDATE Product SET productImageURL = 'img/15.jpg' WHERE ProductId = 15;
UPDATE Product SET productImageURL = 'img/16.jpg' WHERE ProductId = 16;
UPDATE Product SET productImageURL = 'img/17.jpg' WHERE ProductId = 17;
UPDATE Product SET productImageURL = 'img/18.jpg' WHERE ProductId = 18;
UPDATE Product SET productImageURL = 'img/19.jpg' WHERE ProductId = 19;
UPDATE Product SET productImageURL = 'img/20.jpg' WHERE ProductId = 20;
UPDATE Product SET productImageURL = 'img/21.jpg' WHERE ProductId = 21;
UPDATE Product SET productImageURL = 'img/22.jpg' WHERE ProductId = 22;
UPDATE Product SET productImageURL = 'img/23.jpg' WHERE ProductId = 23;
UPDATE Product SET productImageURL = 'img/24.jpg' WHERE ProductId = 24;
UPDATE Product SET productImageURL = 'img/25.jpg' WHERE ProductId = 25;
UPDATE Product SET productImageURL = 'img/26.jpg' WHERE ProductId = 26;
UPDATE Product SET productImageURL = 'img/27.jpg' WHERE ProductId = 27;
UPDATE Product SET productImageURL = 'img/28.jpg' WHERE ProductId = 28;
UPDATE Product SET productImageURL = 'img/29.jpg' WHERE ProductId = 29;