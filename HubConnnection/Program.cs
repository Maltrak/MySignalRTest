using Microsoft.AspNet.SignalR;
using Owin;
using Microsoft.AspNet.SignalR.Client.Hubs;
using System;

namespace HubConnnection
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Nombre:");
            string Name = Console.ReadLine();
            Console.WriteLine("Mensaje:");
            string Message = Console.ReadLine();
            HubConn(Name, Message);
        }
        static void HubConn(string _name, string _message)
        {
            try
            {
                var hubConnection = new HubConnection("http://localhost:34282/");
                IHubProxy HubProxy = hubConnection.CreateHubProxy("messageReceivingHub");
                HubProxy.On<string, string>("addInvoke", (name, message) => Console.WriteLine("Nombre: {0}, Mensage {1}", name, message));
                hubConnection.Start().Wait();
                HubProxy.Invoke("invoke", _name, _message).Wait();
                Console.ReadLine();
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("refused"))
                    Console.WriteLine("Error: Servicio de captura dactilar no disponible: " + ex.InnerException);
                else
                    Console.WriteLine(ex.Message, "Error");
                Console.ReadLine();
            }
        }

    }
}
