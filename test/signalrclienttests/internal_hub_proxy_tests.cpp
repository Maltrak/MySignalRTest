// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

#include "stdafx.h"
#include "trace_log_writer.h"
#include "internal_hub_proxy.h"
#include "test_utils.h"
#include "memory_log_writer.h"
#include "test_transport_factory.h"
#include "hub_connection_impl.h"
#include "signalrclient/signalr_exception.h"

using namespace signalr;

TEST(on, event_name_must_not_be_empty_string)
{
    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(), _XPLATSTR("hub"),
        logger{ std::make_shared<trace_log_writer>(), trace_level::none } };
    try
    {
        hub_proxy.on(_XPLATSTR(""), [](const json::value&){});

        ASSERT_TRUE(false); // exception expected but not thrown
    }
    catch (const std::invalid_argument& e)
    {
        ASSERT_STREQ("event_name cannot be empty", e.what());
    }
}

TEST(on, cannot_register_multiple_handlers_for_event)
{
    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(),
        _XPLATSTR("hub"), logger{ std::make_shared<trace_log_writer>(), trace_level::none } };
    hub_proxy.on(_XPLATSTR("ping"), [](const json::value&){});

    try
    {
        hub_proxy.on(_XPLATSTR("ping"), [](const json::value&){});
        ASSERT_TRUE(false); // exception expected but not thrown
    }
    catch (const signalr_exception& e)
    {
        ASSERT_STREQ("an action for this event has already been registered. event name: ping", e.what());
    }
}

TEST(on, cannot_register_handler_if_connection_not_in_disconnected_state)
{
    try
    {
        auto websocket_client = create_test_websocket_client(
            /* receive function */ []() { return pplx::task_from_result(std::string("{ \"C\":\"x\", \"S\":1, \"M\":[] }")); });
        auto hub_connection = hub_connection_impl::create(_XPLATSTR("http://fakeuri"), _XPLATSTR(""), trace_level::all,
            std::make_shared<trace_log_writer>(), /*use_default_url*/true, create_test_web_request_factory(),
            std::make_unique<test_transport_factory>(websocket_client));

        auto proxy = hub_connection->create_hub_proxy(_XPLATSTR("myhub"));

        hub_connection->start().get();

        proxy->on(_XPLATSTR("myfunc"), [](const web::json::value&){});

        ASSERT_TRUE(false); // exception expected but not thrown
    }
    catch (const signalr_exception& e)
    {
        ASSERT_STREQ("can't register a handler if the connection is in a disconnected state", e.what());
    }
}

TEST(invoke_event, invoke_event_invokes_event_and_passes_arguments)
{
    const auto payload = _XPLATSTR("{\"Contents\":\"My message\"}");

    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(), _XPLATSTR("hub"),
        logger{ std::make_shared<trace_log_writer>(), trace_level::none } };

    auto handler_invoked = false;
    hub_proxy.on(_XPLATSTR("message"), [&handler_invoked, payload](const json::value& arguments)
    {
        handler_invoked = true;
        ASSERT_EQ(payload, arguments.serialize());
    });

    hub_proxy.invoke_event(_XPLATSTR("message"), json::value::parse(payload));

    ASSERT_TRUE(handler_invoked);
}

TEST(invoke_event, logs_if_no_handler_for_an_event)
{
    std::shared_ptr<log_writer> writer(std::make_shared<memory_log_writer>());
    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(), _XPLATSTR("hub"),
        logger{ writer, trace_level::info } };
    hub_proxy.invoke_event(_XPLATSTR("message"), json::value::parse(_XPLATSTR("{}")));

    auto log_entries = std::dynamic_pointer_cast<memory_log_writer>(writer)->get_log_entries();
    ASSERT_FALSE(log_entries.empty());
    auto entry = remove_date_from_log_entry(log_entries[0]);
    ASSERT_EQ(_XPLATSTR("[info        ] no handler found for event. hub name: hub, event name: message\n"), entry);
}

TEST(invoke_json, invoke_json_throws_when_the_underlying_connection_is_not_valid)
{
    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(), _XPLATSTR("hub"),
        logger{ std::make_shared<trace_log_writer>(), trace_level::none } };

    try
    {
        hub_proxy.invoke_json(_XPLATSTR("method"), web::json::value()).get();
        ASSERT_TRUE(true); // exception expected but not thrown
    }
    catch (const signalr_exception& e)
    {
        ASSERT_STREQ("the connection for which this hub proxy was created is no longer valid - it was either destroyed or went out of scope", e.what());
    }
}

TEST(invoke_void, invoke_json_throws_when_the_underlying_connection_is_not_valid)
{
    internal_hub_proxy hub_proxy{ std::weak_ptr<hub_connection_impl>(), _XPLATSTR("hub"),
        logger{ std::make_shared<trace_log_writer>(), trace_level::none } };

    try
    {
        hub_proxy.invoke_void(_XPLATSTR("method"), web::json::value()).get();
        ASSERT_TRUE(true); // exception expected but not thrown
    }
    catch (const signalr_exception& e)
    {
        ASSERT_STREQ("the connection for which this hub proxy was created is no longer valid - it was either destroyed or went out of scope", e.what());
    }
}