
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using SignalR.SelfHost.Server;


[assembly: OwinStartup(typeof(SignalRService.Startup))]
namespace SignalRService
{
    internal class Startup
    {
       
            public void Configuration(IAppBuilder app)
            {
                //app.MapConnection<RawConnection>("/raw", new ConnectionConfiguration { EnableCrossDomain = true });
                //app.MapHubs();
                //app.MapConnection<RawConnection>("/raw-connection", new ConnectionConfiguration { EnableCrossDomain = true });
                app.MapHubs(new HubConfiguration { EnableCrossDomain = true });
            }
       
    }
}