using System;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Hosting;
using Owin;
using Microsoft.Owin.Cors;
using System.Threading.Tasks;


namespace SignalRService
{
    class Program
    {
        static void Main(string[] args)
        {
            using (WebApp.Start<Startup>("http://localhost:34282"))
            {
                Console.WriteLine("Test Service running at http://localhost:34282");
                Console.ReadLine();
            }
        }
    }
}
