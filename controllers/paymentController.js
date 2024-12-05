const FRONTEND_URL = process.env.FRONTEND_URL

const midtransCallback = async (req, res) => {
    const { order_id, status_code, transaction_status } = req.query;
    
    if (!order_id || !status_code || !transaction_status) {
        return res.redirect(`${FRONTEND_URL}/checkout`);
    }

    console.log(`Order ID: ${order_id}`);
    console.log(`Status Code: ${status_code}`);
    console.log(`Transaction Status: ${transaction_status}`);

    if (transaction_status === 'settlement'){
            res.redirect(`${FRONTEND_URL}/payment-result?order_id=${order_id}&status_code=${status_code}&transaction_status=${transaction_status}`);
            res.status(200)
    } else if (transaction_status === 'cancel' ||
          transaction_status === 'deny' ||
          transaction_status === 'expire'){
            res.redirect(`${FRONTEND_URL}/checkout`);
            res.status(200)
    } else if (transaction_status === 'pending'){
            res.redirect(`${FRONTEND_URL}/checkout`);
            res.status(200)
    } 
}

export {
    midtransCallback
}