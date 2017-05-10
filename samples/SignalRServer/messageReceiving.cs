using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;


namespace SignalRServer
{

    public class messageReceivingHub : Hub
    {

        private void Response(string response)
        {
            //Console.WriteLine(response);
            Clients.Caller.clientResponse(response);
        }


        //public override Task OnConnected()
        //{
        //    //Console.WriteLine("Client connected: " + Context.ConnectionId);
        //    return base.OnConnected();
        //}
        public void invoke(string name, string message)
        {
            Boolean succes = false;
            try
            {
                succes = true;
                //Console.WriteLine("Invoke, InitializeCatalogs OK");
                Clients.All.addInvoke(name, message);
            }

            catch (Exception ex)
            {
                //Console.WriteLine("Error en hub invoke: " + ex.Message);
                succes = false;
            }
        }

    }
}
