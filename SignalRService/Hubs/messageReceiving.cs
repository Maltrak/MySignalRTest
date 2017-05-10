using System;
using System.Linq;
using System.Collections.Generic;
//using System.Threading.Tasks;
using System.Configuration;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace SignalRService.Hubs
{
    /// <summary>
    ///Clase que comunica el cliente web con el servicio de identitum local
    /// </summary>
    [HubName("messageReceivingHub")]
    public class messageReceivingHub : Hub
    {

        private void Response(string response)
        {
            //Console.WriteLine(response);
            Clients.All.clientResponse(response);
        }


        //public override Task OnConnected()
        //{
            //Console.WriteLine("Client connected: " + Context.ConnectionId);
        //    return base.OnConnected();
        //}
        public void invoke(string name, string message)
        {
            Boolean succes = false;
            try
            {
                succes = true;
                Console.WriteLine("Invoke,  OK, name:{0} , message: {1}",name,message);
                Clients.Caller.addInvoke(name, message);
            }

            catch (Exception ex)
            {
                Console.WriteLine("Error en hub invoke: " + ex.Message);
                succes = false;
            }
        }

    }
}
