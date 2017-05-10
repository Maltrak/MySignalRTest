using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.SignalR;

[assembly: OwinStartup(typeof(SignalRServer.Startup))]

namespace SignalRServer
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapHubs(new HubConfiguration { EnableJSONP = true });
            app.MapSignalR();
            app.MapSignalR<EchoConnection>("/echo");
        }
    }
}
