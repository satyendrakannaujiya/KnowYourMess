const connection=require('./mysql_connection.js');

const TableStructure=`
CREATE TABLE IF NOT EXISTS HOSTELS(
    hid int NOT NULL AUTO_INCREMENT,
    name char(100) NOT NULL,
    description TEXT,
    pde int default 0,
    PRIMARY KEY(hid)
)
`;

const editHostel=(hostelDetails,callback)=>
{
    if(hostelDetails===undefined||hostelDetails.hid===undefined){
        return callback("Error: insufficient parameters.");
    }
    if(hostelDetails.name===undefined&&hostelDetails.description===undefined&&hostelDetails.pde===undefined)
    {
        return callback("Error: Nothing to change.");
    }

    var editHostelQuery=`UPDATE HOSTELS SET `;
    if(hostelDetails.name!==undefined)
    {
        editHostelQuery=editHostelQuery+`name = \"${hostelDetails.name}\",`;
    }
    if(hostelDetails.description!==undefined)
    {
        editHostelQuery=editHostelQuery+`description=\"${hostelDetails.description}\",`;
    }
    if(hostelDetails.pde!==undefined)
    {
        editHostelQuery=editHostelQuery+`pde=${hostelDetails.pde},`;
    }
    editHostelQuery=editHostelQuery.slice(0, -1);
    editHostelQuery=editHostelQuery+` where hid=${hostelDetails.hid}`;
    connection.query(editHostelQuery,callback);
}

const createHostel=(hostelDetails,callback)=>
{
    if(hostelDetails===undefined||hostelDetails.name===undefined)
    {
        callback("invalid parameters!");
        return;
    }

    var pdeField="pde";
    var pdeValue=hostelDetails.pde===undefined?0:hostelDetails.pde;
    
    var descriptionField="description";
    var descriptionValue=hostelDetails.description===undefined?"":`\"${hostelDetails.description}\"`;

    const createHostelQuery=`
        INSERT INTO HOSTELS(name, ${pdeField}, ${descriptionField}) 
        VALUES(\"${hostelDetails.name}\", ${pdeValue},${descriptionValue} );
    `;
    connection.query(createHostelQuery,(err,res)=>
    {
        if(err)
        {
            return callback(err,false);
        }else
            return callback(undefined,true);
    });
};

const getHostelsList=(callback)=>
{
    const createHostelQuery=`
        SELECT hid,name FROM HOSTELS
    `;
    connection.query(createHostelQuery,callback);
};

const getHostelById=(id,callback)=>
{
    const getHostelByIdQuery=`
        SELECT hid,name,pde,description FROM HOSTELS WHERE hid=${id};
    `;
    connection.query(getHostelByIdQuery,(err,res)=>
    {
        if(err)
            console.log(err);
        callback(err,res[0]);
    });
};

module.exports={
    createHostel,
    getHostelsList,
    getHostelById,
    editHostel
}