const connection=require('./mysql_connection.js');

const TableStructure=`
    CREATE TABLE IF NOT EXISTS WARDENS(
        wid int NOT NULL AUTO_INCREMENT,
        contact char(12),
        name char(40) NOT NULL,
        hid int NOT NULL,
        PRIMARY KEY(wid)
    )
`;

const createWarden=(wardenDetails,callback)=>
{
    const createWardenQuery=`
        INSERT INTO WARDENS(name,hid)
        VALUES(
            \"${wardenDetails.name}\",
            \"${wardenDetails.hid}\"
        )
    `;
    connection.query(createWardenQuery,)
};